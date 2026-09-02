import { NextRequest } from "next/server";
import { deleteCard, listCards, saveCard } from "@/lib/bible-store";
import { fail, localOnly, ok, readCaller, readJson } from "@/lib/bible-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Saved Scripture Card designs from the Designer Pro Studio.
 *
 * A design is the whole designer state — verse text, reference, wallpaper,
 * fonts, colours, aspect ratio, overlay, blur, branding — stored as JSON so a
 * member can reopen a card months later and keep editing it, and so new
 * designer controls persist without a schema change.
 */

export async function GET(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ cards: [] }, "Sign in to save your Scripture cards.");
    }
    const cards = await listCards(caller.uid, 100);
    return ok({ cards, count: cards.length }, { persisted: true });
  } catch (error) {
    return fail(error, { cards: [], count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const caller = await readCaller(req);
    if (!caller.signedIn) {
      return localOnly({ saved: false }, "Sign in to save your Scripture cards.");
    }
    const card = await saveCard(caller.uid, body);
    return ok({ saved: true, card }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const caller = await readCaller(req);
    if (!caller.signedIn) return localOnly({ deleted: false }, "Sign in to manage saved cards.");
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!id) throw new Error("Choose a card to delete.");
    await deleteCard(caller.uid, id);
    return ok({ deleted: true }, { persisted: true });
  } catch (error) {
    return fail(error);
  }
}
