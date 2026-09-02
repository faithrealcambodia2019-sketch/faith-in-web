import { NextRequest } from "next/server";
import {
  archiveCurrentNote,
  deleteNote,
  EMPTY_NOTES,
  getCurrentNote,
  listNotes,
  saveCurrentNote,
} from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sermon Notes Planner.
 *
 * Previously this route kept notes in a module-level Map, which a serverless
 * runtime discards on every cold start — a member's notes were gone within
 * minutes. Signed-in members now read and write Supabase; signed-out visitors
 * keep the original in-memory behaviour so the tab still works for them.
 */

// Retained for signed-out visitors and local development, exactly as before.
const inMemoryNotes = new Map<string, Record<string, string>>();

function guestKey(req: NextRequest) {
  return new URL(req.url).searchParams.get("userId") || "guest";
}

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      const notes = inMemoryNotes.get(guestKey(req)) || { ...EMPTY_NOTES };
      return localOnly({ notes, note: null, history: [] }, "Sign in to keep your notes on every device.");
    }

    const wantsHistory = new URL(req.url).searchParams.get("history") === "1";
    const [note, history] = await Promise.all([
      getCurrentNote(caller.uid),
      wantsHistory ? listNotes(caller.uid, 50) : Promise.resolve([]),
    ]);

    return ok(
      { notes: note?.notes || { ...EMPTY_NOTES }, note, history },
      { persisted: true },
    );
  } catch (error) {
    return fail(error, { notes: { ...EMPTY_NOTES }, note: null, history: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const notes = (body.notes as Record<string, string>) || {
      Doctrine: String(body.Doctrine || ""),
      Encouragement: String(body.Encouragement || ""),
      Application: String(body.Application || ""),
    };

    const caller = await readCaller(req);
    if (!caller.signedIn) {
      inMemoryNotes.set(String(body.userId || "guest"), notes);
      return localOnly({ saved: true, notes }, "Sign in to keep your notes on every device.");
    }

    // "archive" files the current sheet away and starts a fresh one.
    if (body.action === "archive") {
      const archived = await archiveCurrentNote(caller.uid, body.title);
      return ok({ archived, notes: { ...EMPTY_NOTES } }, { persisted: true });
    }

    const saved = await saveCurrentNote(caller.uid, {
      notes,
      title: body.title,
      reference: body.reference,
    });
    return ok({ saved: true, notes: saved.notes, note: saved }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) return localOnly({ deleted: false }, "Sign in to manage saved notes.");
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!id) throw new Error("Choose a note to delete.");
    await deleteNote(caller.uid, id);
    return ok({ deleted: true }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
