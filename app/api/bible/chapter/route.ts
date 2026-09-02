import { NextRequest, NextResponse } from "next/server";
import { getBibleChapter, getParallelChapter, findBibleBook } from "@/lib/bible-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookParam = searchParams.get("book") || searchParams.get("b") || "John";
    const chapterParam = searchParams.get("chapter") || searchParams.get("c") || "1";
    const version = searchParams.get("version") || searchParams.get("v") || searchParams.get("translation") || "KHMER_OLD_1954";
    const version2 = searchParams.get("version2") || searchParams.get("compare") || "";

    const book = findBibleBook(bookParam);
    const chapterNum = Math.max(1, Math.min(book.chapters, Number(chapterParam) || 1));

    if (version2) {
      const result = await getParallelChapter(book.name, chapterNum, version, version2);
      return NextResponse.json({
        success: true,
        status: "ready",
        data: result,
        items: result.items,
        translation: result.version1,
        reference: `${result.khmerBook} ${result.chapter}`
      });
    }

    const result = await getBibleChapter(book.name, chapterNum, version);
    return NextResponse.json({
      success: true,
      status: "ready",
      data: result,
      items: result.items,
      translation: result.version,
      reference: `${result.khmerBook} ${result.chapter}`,
      attribution: "Khmer Old Version (1954) & Public Domain English Translations",
      attributionUrl: "https://faithin.co/bible"
    });
  } catch (error) {
    console.error("[Faith In Bible] Chapter request failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load Bible chapter." },
      { status: 500 }
    );
  }
}
