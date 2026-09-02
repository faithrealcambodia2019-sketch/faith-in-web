import { NextResponse } from "next/server";
import { getDailyVerse } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const daily = getDailyVerse();
    return NextResponse.json({
      success: true,
      data: daily
    });
  } catch (error) {
    console.error("[Faith In Bible] Daily verse request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Daily Verse." },
      { status: 500 }
    );
  }
}
