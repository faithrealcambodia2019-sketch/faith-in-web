import { NextRequest } from "next/server";
import { listMemoryProgress, saveMemoryProgress } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CPTI Scripture Memory progress.
 *
 * Records where a member is on each of the memorisation passages — learning,
 * reviewing or memorised, how much of the text they can recite with words
 * hidden, how many times they have reviewed it, and their best typing run on
 * it. The review count is incremented server-side so a replayed request cannot
 * inflate it.
 *
 * Note the path: /api/bible/memory serves the passage catalogue and stays
 * exactly as it was. This child route adds the per-member progress on top.
 */

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ progress: [], summary: emptySummary() }, "Sign in to track your memory work.");
    }
    const progress = await listMemoryProgress(caller.uid);
    return ok({ progress, summary: summarise(progress) }, { persisted: true });
  } catch (error) {
    return fail(error, { progress: [], summary: emptySummary() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ saved: false }, "Sign in to track your memory work.");
    }
    const entry = await saveMemoryProgress(caller.uid, body);
    return ok({ saved: true, progress: entry }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}

type Progress = Awaited<ReturnType<typeof listMemoryProgress>>[number];

function emptySummary() {
  return { memorised: 0, reviewing: 0, learning: 0, total: 0, averageMastery: 0 };
}

function summarise(progress: Progress[]) {
  if (!progress.length) return emptySummary();
  const count = (status: Progress["status"]) => progress.filter((item) => item.status === status).length;
  return {
    memorised: count("memorised"),
    reviewing: count("reviewing"),
    learning: count("learning"),
    total: progress.length,
    averageMastery: Math.round(
      progress.reduce((sum, item) => sum + item.mastery, 0) / progress.length,
    ),
  };
}
