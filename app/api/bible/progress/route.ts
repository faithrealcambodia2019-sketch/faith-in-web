import { NextRequest } from "next/server";
import { getStreak, listReading, recordReading } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reading progress and the daily streak.
 *
 * Every chapter a member opens is recorded once per day, which gives both the
 * "chapters read" figure and a streak that survives a page refresh — the
 * unique index means re-opening the same chapter does not count twice.
 */

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ streak: 0, chaptersRead: 0, recent: [] }, "Sign in to build a reading streak.");
    }
    const [recent, streak] = await Promise.all([listReading(caller.uid, 120), getStreak(caller.uid)]);
    return ok(
      {
        streak,
        chaptersRead: new Set(recent.map((entry) => `${entry.book} ${entry.chapter}`)).size,
        recent: recent.slice(0, 30),
      },
      { persisted: true },
    );
  } catch (error) {
    return fail(error, { streak: 0, chaptersRead: 0, recent: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ saved: false, streak: 0 }, "Sign in to build a reading streak.");
    }
    const { entry, streak } = await recordReading(caller.uid, body);
    return ok({ saved: true, entry, streak }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
