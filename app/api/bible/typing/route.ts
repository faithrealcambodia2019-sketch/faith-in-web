import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/verify-firebase-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scripture typing scores.
 *
 * Same fix as the notes route beside it: this used to key the store on a
 * `userId` taken straight from the request body, with no authentication, so
 * any anonymous caller could write scores into another member's history. The
 * key is now the uid from a verified Firebase ID token.
 *
 * The history is also capped. This Map has no eviction, and an unauthenticated
 * loop against it was a memory-exhaustion lever on a shared serverless
 * instance.
 */
const inMemoryTypingScores = new Map<string, Array<{ passage: string; wpm: number; accuracy: number; date: string }>>();

const MAX_HISTORY = 100;

function bounded(value: unknown, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
}

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    uid = (await requireMember(req)).uid;
  } catch {
    return NextResponse.json({ success: false, error: "Sign in to save your score." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const passage = String(body.passage || body.reference || "Psalm 23").slice(0, 120);
    const wpm = bounded(body.wpm ?? body.score, 500);
    const accuracy = bounded(body.accuracy ?? 100, 100);

    const list = inMemoryTypingScores.get(uid) || [];
    list.push({ passage, wpm, accuracy, date: new Date().toISOString() });
    inMemoryTypingScores.set(uid, list.slice(-MAX_HISTORY));

    return NextResponse.json({ success: true, data: { saved: true, wpm, accuracy, passage } });
  } catch (error) {
    console.error("[Faith In Bible] Typing score save failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save score." }, { status: 500 });
  }
}
