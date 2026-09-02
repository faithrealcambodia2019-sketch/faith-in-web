import { NextResponse } from "next/server";
import { getBibleMediaList } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = getBibleMediaList();
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[Faith In Bible] Media request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Bible media." },
      { status: 500 }
    );
  }
}
