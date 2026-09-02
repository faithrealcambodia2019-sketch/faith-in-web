import { NextRequest } from "next/server";
import { DEFAULT_PREFERENCES, getStudioDashboard } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One call that hydrates the whole Bible Studio for a signed-in member:
 * preferences, the open sermon note and its history, saved Scripture cards,
 * bookmarks, memory progress, typing scores, recent concordance searches, and
 * the headline stats the Studio dashboard shows.
 *
 * Fetching these together keeps the Studio to a single round trip on load
 * rather than seven.
 */

const EMPTY_DASHBOARD = {
  preferences: DEFAULT_PREFERENCES,
  currentNote: null,
  notes: [],
  cards: [],
  bookmarks: [],
  memory: [],
  scores: [],
  recentSearches: [],
  stats: {
    savedCards: 0,
    savedNotes: 0,
    bookmarks: 0,
    passagesMemorised: 0,
    passagesInProgress: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    chaptersRead: 0,
    streak: 0,
  },
};

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly(EMPTY_DASHBOARD, "Sign in to see your saved Bible Studio work.");
    }
    const dashboard = await getStudioDashboard(caller.uid);
    return ok(dashboard, { persisted: true });
  } catch (error) {
    return fail(error, EMPTY_DASHBOARD);
  }
}
