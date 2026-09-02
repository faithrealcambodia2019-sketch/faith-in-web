import { NextResponse } from "next/server";
import { BIBLE_BOOKS, publicBibleVersions } from "@/lib/bible";

export const dynamic = "force-dynamic";

export async function GET() {
  const youVersionConfigured = Boolean(process.env.YVP_APP_KEY?.trim());
  return NextResponse.json(
    {
      versions: publicBibleVersions(youVersionConfigured),
      books: BIBLE_BOOKS,
      defaults: {
        primaryVersion: "KHMER_OLD_1954",
        secondaryVersion: "KJV",
        book: "John",
        chapter: 3,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
