import { NextRequest, NextResponse } from "next/server";
import { searchScripture } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const limit = Number(searchParams.get("limit")) || 20;
    const version = searchParams.get("version") || "KHMER_OLD_1954";

    // Searches the full imported Khmer text when it is present, and falls back
    // to the verses embedded in lib/bible-service.ts when it is not.
    const results = await searchScripture(query, limit, version);
    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("[Faith In Bible] Search failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search Bible text." },
      { status: 500 }
    );
  }
}
