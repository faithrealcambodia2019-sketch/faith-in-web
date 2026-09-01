import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/compat/route";

function request(body: BodyInit | null, contentType = "application/json", contentLength?: number) {
  const headers = new Headers({ "content-type": contentType });
  if (contentLength !== undefined) headers.set("content-length", String(contentLength));
  return new NextRequest("https://faithin.co/api/compat", { method: "POST", headers, body });
}

test("compat route fails safely when the optional database is not configured", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const response = await POST(request(JSON.stringify({ action: "cv_social_get_message_threads" })));
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.match(body.data, /Firebase data backend remains available/);
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});

test("compat route rejects malformed JSON before touching backend services", async () => {
  const response = await POST(request("{"));
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.match(body.data, /valid JSON/);
});

test("compat route validates action names", async () => {
  const response = await POST(request(JSON.stringify({ action: "../../admin" })));
  assert.equal(response.status, 400);
  assert.match((await response.json()).data, /not valid/);
});

test("compat route accepts form requests without bypassing configuration checks", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const response = await POST(
      request("action=cv_get_posts", "application/x-www-form-urlencoded;charset=UTF-8"),
    );
    assert.equal(response.status, 503);
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});

test("compat route rejects unsupported media types and oversized bodies", async () => {
  const wrongType = await POST(request("action=cv_get_posts", "text/plain"));
  assert.equal(wrongType.status, 415);

  const oversized = await POST(
    request(JSON.stringify({ action: "cv_get_posts" }), "application/json", 1_048_577),
  );
  assert.equal(oversized.status, 413);
});
