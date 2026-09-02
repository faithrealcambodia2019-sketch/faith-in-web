import { NextRequest, NextResponse } from "next/server";
import { getConcordance } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";

    const result = getConcordance(query);
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[Faith In Bible] Concordance lookup failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to look up Concordance." },
      { status: 500 }
    );
  }
}
