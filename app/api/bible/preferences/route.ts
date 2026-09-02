import { NextRequest } from "next/server";
import { DEFAULT_PREFERENCES, getPreferences, savePreferences } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reader and Studio preferences: translations, last book and chapter, font
 * size, the tool that was open, and the member's preferred designer defaults.
 *
 * These already lived in localStorage, so a member lost them whenever they
 * switched device or cleared their browser. Storing them per member means the
 * Bible opens where they left off, everywhere.
 */

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly(
        { preferences: { ...DEFAULT_PREFERENCES } },
        "Sign in to carry your reading place between devices.",
      );
    }
    const preferences = await getPreferences(caller.uid);
    return ok({ preferences }, { persisted: true });
  } catch (error) {
    return fail(error, { preferences: { ...DEFAULT_PREFERENCES } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ saved: false }, "Sign in to carry your reading place between devices.");
    }
    const preferences = await savePreferences(caller.uid, body);
    return ok({ saved: true, preferences }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
