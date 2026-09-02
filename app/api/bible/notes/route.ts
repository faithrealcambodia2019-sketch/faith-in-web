import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory / session store fallback for development and serverless testing
const inMemoryNotes = new Map<string, Record<string, string>>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest";
    const notes = inMemoryNotes.get(userId) || {
      Doctrine: "",
      Encouragement: "",
      Application: ""
    };
    return NextResponse.json({ success: true, data: { notes } });
  } catch (error) {
    console.error("[Faith In Bible] Notes get failed:", error);
    return NextResponse.json({ success: false, error: "Failed to load notes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "guest";
    const notes = body.notes || {
      Doctrine: body.Doctrine || "",
      Encouragement: body.Encouragement || "",
      Application: body.Application || ""
    };

    inMemoryNotes.set(userId, notes);
    return NextResponse.json({ success: true, data: { saved: true, notes } });
  } catch (error) {
    console.error("[Faith In Bible] Notes save failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save notes." }, { status: 500 });
  }
}
