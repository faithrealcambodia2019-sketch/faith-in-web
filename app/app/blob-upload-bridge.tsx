"use client";

import { useEffect } from "react";

type UploadResult = {
  url: string;
  local_url: string;
  preview_url: string;
  drive_url: string;
  type: "image" | "video" | "audio" | "file";
  mime: string;
  name: string;
  size: number;
  path: string;
};

declare global {
  interface Window {
    cvBlobUpload?: (
      file: File,
      idToken: string,
      onProgress?: (fraction: number) => void,
    ) => Promise<UploadResult>;
  }
}

function kindOf(type: string): UploadResult["type"] {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}

type UploadTicket = {
  signed_url: string;
  publishable_key: string;
  item: UploadResult;
};

async function requestTicket(file: File, idToken: string): Promise<UploadTicket> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      "x-faith-in-supabase-upload": "1",
    },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success || !body?.data?.upload) {
    throw new Error(typeof body?.data === "string" ? body.data : "Upload could not be started.");
  }
  return body.data.upload as UploadTicket;
}

function uploadToTicket(
  file: File,
  ticket: UploadTicket,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.signed_url, true);
    xhr.setRequestHeader("x-upsert", "false");
    if (ticket.publishable_key) {
      xhr.setRequestHeader("apikey", ticket.publishable_key);
      xhr.setRequestHeader("Authorization", `Bearer ${ticket.publishable_key}`);
    }
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total) onProgress(event.loaded / event.total);
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve(ticket.item);
        return;
      }
      let message = "";
      try {
        const errorBody = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = errorBody.message || errorBody.error || "";
      } catch {}
      reject(new Error(message || "Upload failed. Please try again."));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Please check your connection and try again."));

    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    xhr.send(form);
  });
}

export default function BlobUploadBridge() {
  useEffect(() => {
    window.cvBlobUpload = async (file, idToken, onProgress) => {
      if (!idToken) throw new Error("Your session could not be verified. Please log in again.");
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(`"${file.name || "file"}" is larger than the free 50MB per-file limit.`);
      }
      const ticket = await requestTicket(file, idToken);
      const item = await uploadToTicket(file, ticket, onProgress);
      return {
        ...item,
        type: item.type || kindOf(file.type),
        mime: item.mime || file.type,
        name: item.name || file.name,
        size: item.size || file.size,
      };
    };

    return () => {
      delete window.cvBlobUpload;
    };
  }, []);

  return null;
}
