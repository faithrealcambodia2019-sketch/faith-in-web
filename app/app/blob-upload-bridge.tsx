"use client";

import { useEffect } from "react";
import { upload } from "@vercel/blob/client";

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

function safeName(name: string) {
  return (name || "upload").replace(/[^\w.\-]+/g, "_").slice(-80);
}

function kindOf(type: string): UploadResult["type"] {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}

export default function BlobUploadBridge() {
  useEffect(() => {
    window.cvBlobUpload = async (file, idToken, onProgress) => {
      const encodedPayload = idToken.split(".")[1];
      if (!encodedPayload) throw new Error("Your session could not be verified. Please log in again.");
      const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as { sub?: unknown };
      if (!payload.sub || typeof payload.sub !== "string") {
        throw new Error("Your session could not be verified. Please log in again.");
      }

      const blob = await upload(`faith-in/${payload.sub}/${safeName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        // The Vercel client-token request is a separate request from the Blob
        // PUT. Authenticate that request explicitly; relying on an ID token in
        // clientPayload left the route unable to distinguish it from the
        // legacy multipart endpoint in production.
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-faith-in-blob-token-request": "1",
        },
        contentType: file.type,
        multipart: file.size > 100 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => onProgress?.(percentage / 100),
      });

      onProgress?.(1);
      return {
        url: blob.url,
        local_url: blob.url,
        preview_url: blob.url,
        drive_url: "",
        type: kindOf(file.type),
        mime: file.type,
        name: file.name,
        size: file.size,
        path: blob.pathname,
      };
    };

    return () => {
      delete window.cvBlobUpload;
    };
  }, []);

  return null;
}
