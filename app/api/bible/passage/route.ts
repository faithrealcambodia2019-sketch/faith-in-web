import { NextRequest, NextResponse } from "next/server";
import { getBibleChapter, findBibleBook } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passage = searchParams.get("passage") || "JHN.3.16";
    const version = searchParams.get("version") || searchParams.get("bible_id") || "KHMER_OLD_1954";

    // Parse USFM or standard passage like "JHN.3.16" or "John 3:16"
    const match = passage.match(/^([A-Za-z0-9]+)[\s.:]+(\d+)(?:[:.](\d+))?/);
    const bookKey = match ? match[1] : "John";
    const chapter = match ? Number(match[2]) : 3;
    const targetVerse = match && match[3] ? Number(match[3]) : null;

    const book = findBibleBook(bookKey);
    const result = await getBibleChapter(book.name, chapter, version);

    if (targetVerse) {
      const single = result.items.find((i) => i.v === targetVerse);
      return NextResponse.json({
        success: true,
        data: {
          passage,
          ref: `${book.name} ${chapter}:${targetVerse}`,
          khmerRef: `${book.khmerName} ${chapter}:${targetVerse}`,
          text: single ? single.text : result.items[0]?.text || "",
          khmer: single ? single.text : result.items[0]?.text || "",
          version: result.version,
          versionName: result.versionName,
          source: result.source
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[Faith In Bible] Passage request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Bible passage." },
      { status: 500 }
    );
  }
}
