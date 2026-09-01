import { NextRequest, NextResponse } from "next/server";
import {
  isOptionalServerBackendConfigured,
  OPTIONAL_SERVER_BACKEND_MESSAGE,
} from "@/lib/optional-server-backend";

function unavailable() {
  return NextResponse.json(
    { error: OPTIONAL_SERVER_BACKEND_MESSAGE },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request: NextRequest) {
  if (!isOptionalServerBackendConfigured()) return unavailable();
  const { handlers } = await import("@/auth");
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!isOptionalServerBackendConfigured()) return unavailable();
  const { handlers } = await import("@/auth");
  return handlers.POST(request);
}
