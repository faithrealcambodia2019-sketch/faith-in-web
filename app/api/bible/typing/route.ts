import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inMemoryTypingScores = new Map<string, Array<{ passage: string; wpm: number; accuracy: number; date: string }>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "guest";
    const passage = body.passage || body.reference || "Psalm 23";
    const wpm = Number(body.wpm) || Number(body.score) || 0;
    const accuracy = Number(body.accuracy) || 100;

    const list = inMemoryTypingScores.get(userId) || [];
    list.push({ passage, wpm, accuracy, date: new Date().toISOString() });
    inMemoryTypingScores.set(userId, list);

    return NextResponse.json({
      success: true,
      data: { saved: true, wpm, accuracy, passage }
    });
  } catch (error) {
    console.error("[Faith In Bible] Typing score save failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save score." }, { status: 500 });
  }
}
