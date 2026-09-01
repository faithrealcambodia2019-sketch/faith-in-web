import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userJourneys, userJourneyProgress } from "@/lib/db/schema";
import {
  isOptionalServerBackendConfigured,
  OPTIONAL_SERVER_BACKEND_MESSAGE,
} from "@/lib/optional-server-backend";
import { eq, and } from "drizzle-orm";

function unavailable() {
  return NextResponse.json(
    { error: OPTIONAL_SERVER_BACKEND_MESSAGE },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  if (!isOptionalServerBackendConfigured()) return unavailable();

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
  }

  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > 16_384) {
    return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
  }

  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, journeyId, stepId, response } = body as Record<string, unknown>;

  if (action === "start") {
    if (typeof journeyId !== "string" || !journeyId.trim() || journeyId.length > 128) {
      return NextResponse.json({ error: "A valid journeyId is required" }, { status: 400 });
    }

    const existing = await db.query.userJourneys.findFirst({
      where: and(eq(userJourneys.userId, session.user.id), eq(userJourneys.journeyId, journeyId))
    });
    if (!existing) {
      await db.insert(userJourneys).values({
        userId: session.user.id,
        journeyId,
        status: "started"
      });
    }
    return NextResponse.json({ success: true });
  }

  if (action === "complete_step") {
    if (typeof stepId !== "string" || !stepId.trim() || stepId.length > 128) {
      return NextResponse.json({ error: "A valid stepId is required" }, { status: 400 });
    }
    if (response != null && (typeof response !== "string" || response.length > 5_000)) {
      return NextResponse.json({ error: "Response must be 5,000 characters or fewer" }, { status: 400 });
    }

    await db.insert(userJourneyProgress).values({
      userId: session.user.id,
      stepId,
      response: typeof response === "string" ? response : null,
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  if (!isOptionalServerBackendConfigured()) return unavailable();

  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myJourneys = await db.query.userJourneys.findMany({
    where: eq(userJourneys.userId, session.user.id)
  });

  return NextResponse.json({ journeys: myJourneys });
}
