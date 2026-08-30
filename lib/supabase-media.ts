import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireMember } from "@/lib/verify-firebase-token";

export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_FILES = 10;
const BUCKET = "faithin-media";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/opus",
  "audio/webm",
  "application/pdf",
  "application/zip",
]);

type UploadRequest = {
  name?: unknown;
  type?: unknown;
  size?: unknown;
};

let client: SupabaseClient | null = null;

function storageClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error("Free media storage is not configured yet.");
  if (!client) {
    client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}

function safeName(name: string) {
  return (name || "upload").replace(/[^\w.\-]+/g, "_").slice(-80);
}

function displayName(name: string) {
  return (name || "upload").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 160) || "upload";
}

function kindOf(type: string) {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}

function validateFile(name: string, type: string, size: number) {
  if (!name || !Number.isFinite(size) || size <= 0) {
    throw new Error("Choose a non-empty file to upload.");
  }
  if (size > MAX_MEDIA_BYTES) {
    throw new Error(
      `"${displayName(name)}" is ${Math.ceil(size / 1048576)}MB. The free storage limit is 50MB per file.`,
    );
  }
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error(`"${displayName(name)}" is not a supported image, video, audio, PDF, or ZIP file.`);
  }
}

function objectPath(uid: string, name: string) {
  return `faith-in/${uid}/${Date.now()}-${crypto.randomUUID()}-${safeName(name)}`;
}

function uploadItem(path: string, publicUrl: string, name: string, type: string, size: number) {
  return {
    url: publicUrl,
    local_url: publicUrl,
    preview_url: publicUrl,
    drive_url: "",
    type: kindOf(type),
    mime: type,
    name: displayName(name),
    size,
    path,
  };
}

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Upload could not be started.";
  return NextResponse.json({ success: false, data: message }, { status });
}

async function signedUpload(request: Request) {
  const member = await requireMember(request);
  const body = (await request.json()) as UploadRequest;
  const name = typeof body.name === "string" ? body.name : "";
  const type = typeof body.type === "string" ? body.type.toLowerCase() : "";
  const size = typeof body.size === "number" ? body.size : Number(body.size);
  validateFile(name, type, size);

  const supabase = storageClient();
  const path = objectPath(member.uid, name);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.signedUrl || !data.token) {
    console.error("[Faith In] Supabase signed upload failed", error);
    throw new Error("Free media storage could not start the upload. Please try again.");
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({
    success: true,
    data: {
      upload: {
        signed_url: data.signedUrl,
        publishable_key: process.env.SUPABASE_PUBLISHABLE_KEY || "",
        item: uploadItem(path, publicUrl, name, type, size),
      },
    },
  });
}

async function compatibilityUpload(request: Request) {
  const member = await requireMember(request);
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_SERVER_UPLOAD_BYTES + 1024 * 1024) {
    throw new Error("Refresh this page before uploading files larger than 4MB.");
  }

  const form = await request.formData();
  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (!files.length) throw new Error("Choose a file to upload.");
  if (files.length > MAX_FILES) throw new Error(`You can upload up to ${MAX_FILES} files at once.`);

  const supabase = storageClient();
  const items = [];
  for (const file of files) {
    const type = (file.type || "").toLowerCase();
    validateFile(file.name, type, file.size);
    if (file.size > MAX_SERVER_UPLOAD_BYTES) {
      throw new Error("Refresh this page before uploading files larger than 4MB.");
    }
    const path = objectPath(member.uid, file.name);
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: type,
      upsert: false,
    });
    if (error) {
      console.error("[Faith In] Supabase compatibility upload failed", error);
      throw new Error("Upload failed. Please try again.");
    }
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    items.push(uploadItem(path, publicUrl, file.name, type, file.size));
  }

  return NextResponse.json({ success: true, data: { items } });
}

export async function handleMediaUpload(request: Request) {
  try {
    const contentType = (request.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) return await signedUpload(request);
    return await compatibilityUpload(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = /session|log in|verify your email/i.test(message) ? 401 : 400;
    return errorResponse(error, status);
  }
}
