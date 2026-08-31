import { handleMediaUpload } from "@/lib/supabase-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleMediaUpload(request);
}
