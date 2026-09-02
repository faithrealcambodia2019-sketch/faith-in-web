/**
 * Shared plumbing for the Bible Studio API routes.
 *
 * Three concerns live here so each route file stays about its own data:
 *   1. Identifying the caller from their Firebase ID token.
 *   2. Turning any thrown error into a response a member can read.
 *   3. Reading a size-capped JSON body.
 *
 * Guest behaviour is deliberate. Before this backend existed the Bible tools
 * worked while signed out, so a signed-out caller still gets a successful
 * response — it simply carries `persisted: false`, and the browser keeps the
 * value in localStorage instead. Nothing that used to work stops working.
 */

import { NextResponse } from "next/server";
import { BibleStoreUnavailable, isBibleStoreConfigured } from "@/lib/bible-store";
import { bearerToken, verifyFirebaseToken, type VerifiedUser } from "@/lib/verify-firebase-token";

const MAX_BODY_BYTES = 1_048_576;

export type Caller =
  | { signedIn: true; uid: string; member: VerifiedUser }
  | { signedIn: false; uid: null; member: null };

/**
 * Resolves the caller without ever rejecting a guest. An invalid or expired
 * token is treated as "signed out" rather than an error, so a stale tab
 * degrades to local-only saving instead of showing a failure.
 */
export async function readCaller(request: Request): Promise<Caller> {
  const token = bearerToken(request);
  if (!token) return { signedIn: false, uid: null, member: null };
  try {
    const member = await verifyFirebaseToken(token);
    return { signedIn: true, uid: member.uid, member };
  } catch {
    return { signedIn: false, uid: null, member: null };
  }
}

/** For routes where there is nothing sensible to return to a guest. */
export async function requireCaller(request: Request): Promise<{ uid: string; member: VerifiedUser }> {
  const caller = await readCaller(request);
  if (!caller.signedIn) throw new UnauthorisedError();
  return { uid: caller.uid, member: caller.member };
}

export class UnauthorisedError extends Error {
  constructor(message = "Please sign in to Faith In to use this.") {
    super(message);
    this.name = "UnauthorisedError";
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new Error("That request is too large.");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Error("Send a valid JSON request.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Send a valid request object.");
  }
  return body as Record<string, unknown>;
}

export function ok(data: unknown, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, data, ...extra });
}

/**
 * One error shape for every Bible Studio route.
 *
 * A store that is not configured yet is reported as HTTP 200 with
 * `persisted: false`, not as a failure — the feature still works locally and
 * the member should not see an error for a deployment step they cannot take.
 */
export function fail(error: unknown, fallbackData: unknown = null) {
  if (error instanceof BibleStoreUnavailable) {
    return NextResponse.json({
      success: true,
      persisted: false,
      reason: error.message,
      data: fallbackData,
    });
  }
  if (error instanceof UnauthorisedError) {
    return NextResponse.json(
      { success: false, persisted: false, data: error.message },
      { status: 401 },
    );
  }
  const message = error instanceof Error ? error.message : "That could not be completed.";
  const status = /sign in|session|expired/i.test(message) ? 401 : 400;
  return NextResponse.json({ success: false, persisted: false, data: message }, { status });
}

/** Lets a route answer a guest, or an unconfigured deployment, without erroring. */
export function localOnly(data: unknown, reason: string) {
  return NextResponse.json({ success: true, persisted: false, reason, data });
}

export const STORE_READY = isBibleStoreConfigured;
