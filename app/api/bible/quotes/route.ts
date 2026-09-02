import { NextRequest, NextResponse } from "next/server";
import { getBibleQuotes } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "general";

    const result = getBibleQuotes(type);
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[Faith In Bible] Quotes request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load quotes." },
      { status: 500 }
    );
  }
}
