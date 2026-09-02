import { NextRequest, NextResponse } from "next/server";
import { getMemoryPassages } from "@/lib/bible-memory-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const part = searchParams.get("part") ? Number(searchParams.get("part")) : undefined;
    const q = searchParams.get("q") || "";

    const data = getMemoryPassages(part, q);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("[Faith In Bible] Memory passages failed:", error);
    return NextResponse.json({ success: false, error: "Failed to load scripture memory passages." }, { status: 500 });
  }
}
