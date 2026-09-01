import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journeys, userJourneys, userJourneyProgress } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, journeyId, stepId, response } = await req.json();

  if (action === "start") {
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
    await db.insert(userJourneyProgress).values({
      userId: session.user.id,
      stepId,
      response
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myJourneys = await db.query.userJourneys.findMany({
    where: eq(userJourneys.userId, session.user.id)
  });

  return NextResponse.json({ journeys: myJourneys });
}
