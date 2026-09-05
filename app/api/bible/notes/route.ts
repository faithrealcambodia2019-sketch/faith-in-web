import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/verify-firebase-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Study notes.
 *
 * These handlers used to take `userId` from the query string and the request
 * body with no authentication at all, so any anonymous caller could read or
 * overwrite another member's notes just by naming their uid — and uids are
 * handed to every verified member through publicProfiles. The store is a
 * per-instance Map today, which limited the damage, but the shape of the bug
 * was "trust an identifier the caller supplied", and it would have become a
 * real breach the moment this was backed by a database.
 *
 * The key is now the uid from a verified Firebase ID token. Nothing the caller
 * sends decides whose notes are touched.
 */
const inMemoryNotes = new Map<string, Record<string, string>>();

const EMPTY = { Doctrine: "", Encouragement: "", Application: "" };

/** Keep one member's notes bounded — this Map has no eviction. */
const MAX_FIELD = 20000;

function clean(value: unknown): string {
  return typeof value === "string" ? value.slice(0, MAX_FIELD) : "";
}

export async function GET(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireMember(req)).uid;
  } catch {
    return NextResponse.json({ success: false, error: "Sign in to load your notes." }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: { notes: inMemoryNotes.get(uid) || EMPTY } });
}

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireMember(req)).uid;
  } catch {
    return NextResponse.json({ success: false, error: "Sign in to save your notes." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const source = body.notes || body;
    const notes = {
      Doctrine: clean(source.Doctrine),
      Encouragement: clean(source.Encouragement),
      Application: clean(source.Application)
    };
    inMemoryNotes.set(uid, notes);
    return NextResponse.json({ success: true, data: { saved: true, notes } });
  } catch (error) {
    console.error("[Faith In Bible] Notes save failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save notes." }, { status: 500 });
  }
}
