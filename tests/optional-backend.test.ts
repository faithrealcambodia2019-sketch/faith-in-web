import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { GET as authGet, POST as authPost } from "../app/api/auth/[...nextauth]/route";
import { GET as journeyGet, POST as journeyPost } from "../app/api/journey/route";

async function withoutOptionalBackend(run: () => Promise<void>) {
  const previousSecret = process.env.AUTH_SECRET;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  delete process.env.AUTH_SECRET;
  delete process.env.DATABASE_URL;

  try {
    await run();
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
}

test("Auth.js routes fail safely when the optional backend is unavailable", async () => {
  await withoutOptionalBackend(async () => {
    for (const [method, handler] of [
      ["GET", authGet],
      ["POST", authPost],
    ] as const) {
      const request = new NextRequest("https://faithin.co/api/auth/session", { method });
      const response = await handler(request);
      const body = await response.json();

      assert.equal(response.status, 503);
      assert.match(body.error, /optional server backend is not configured/i);
      assert.equal(response.headers.get("cache-control"), "no-store");
    }
  });
});

test("journey routes fail safely before authentication or database access", async () => {
  await withoutOptionalBackend(async () => {
    const getResponse = await journeyGet();
    assert.equal(getResponse.status, 503);

    const postResponse = await journeyPost(
      new NextRequest("https://faithin.co/api/journey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "start", journeyId: "journey-1" }),
      })
    );
    assert.equal(postResponse.status, 503);
    assert.match((await postResponse.json()).error, /primary Firebase backend remains available/i);
  });
});
