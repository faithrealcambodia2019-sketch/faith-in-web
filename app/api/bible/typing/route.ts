import { NextRequest } from "next/server";
import { listTypingScores, saveTypingScore } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scripture typing scores.
 *
 * The previous implementation pushed each attempt into a module-level Map, so
 * a member's personal best never survived a cold start and there was no way to
 * read scores back at all. Scores now persist per member, and GET returns the
 * history plus the personal best that the Memory tool shows.
 */

const inMemoryTypingScores = new Map<
  string,
  Array<{ passage: string; wpm: number; accuracy: number; date: string }>
>();

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      const scores = inMemoryTypingScores.get("guest") || [];
      return localOnly(
        { scores, bestWpm: scores.reduce((best, s) => Math.max(best, s.wpm), 0) },
        "Sign in to keep your typing history.",
      );
    }
    const scores = await listTypingScores(caller.uid, 50);
    return ok(
      {
        scores,
        bestWpm: scores.reduce((best, score) => Math.max(best, score.wpm), 0),
        attempts: scores.length,
      },
      { persisted: true },
    );
  } catch (error) {
    return fail(error, { scores: [], bestWpm: 0, attempts: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);

    if (!caller.signedIn) {
      const userId = String(body.userId || "guest");
      const list = inMemoryTypingScores.get(userId) || [];
      list.push({
        passage: String(body.passage || body.reference || "Psalm 23"),
        wpm: Number(body.wpm) || Number(body.score) || 0,
        accuracy: Number(body.accuracy) || 100,
        date: new Date().toISOString(),
      });
      inMemoryTypingScores.set(userId, list);
      return localOnly({ saved: true }, "Sign in to keep your typing history.");
    }

    const { score, personalBest } = await saveTypingScore(caller.uid, body);
    return ok({ saved: true, score, personalBest }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
