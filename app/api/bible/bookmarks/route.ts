import { NextRequest } from "next/server";
import { deleteBookmark, listBookmarks, saveBookmark } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verse bookmarks and highlights from the Reader and Parallel tools.
 *
 * The unique index on (member, book, chapter, verse, version) means tapping
 * the same verse twice updates the colour or note instead of stacking
 * duplicates.
 */

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ bookmarks: [] }, "Sign in to keep your bookmarks.");
    }
    const bookmarks = await listBookmarks(caller.uid, 200);
    return ok({ bookmarks, count: bookmarks.length }, { persisted: true });
  } catch (error) {
    return fail(error, { bookmarks: [], count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);
    if (!caller.signedIn) return localOnly({ saved: false }, "Sign in to keep your bookmarks.");
    const bookmark = await saveBookmark(caller.uid, body);
    return ok({ saved: true, bookmark }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) return localOnly({ deleted: false }, "Sign in to manage bookmarks.");
    const params = new URL(req.url).searchParams;
    await deleteBookmark(caller.uid, {
      id: params.get("id") || "",
      book: params.get("book") || "",
      chapter: params.get("chapter") || "",
      verse: params.get("verse") || "",
      version: params.get("version") || "",
    });
    return ok({ deleted: true }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
