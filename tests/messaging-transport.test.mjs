import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const messaging = read("../public/faithin-app/assets/faithin-messaging.js");
const live = read("../public/faithin-app/assets/faithin-live.js");
const runtime = read("../public/faithin-app/assets/faithin-runtime.js");
const networkTransport = runtime.slice(
  runtime.indexOf("function requestNetwork"),
  runtime.indexOf("window.FIData"),
);

test("messaging uses the live Firebase data layer", () => {
  assert.match(messaging, /const live = window\.FILive;/);
  assert.match(messaging, /const api = live\.api;/);
  assert.match(live, /const api = window\.FIData;/);
  assert.match(networkTransport, /window\.cvDataRequest\(action/);
  assert.doesNotMatch(networkTransport, /fetch\s*\(/);
});

test("messaging keeps realtime subscriptions and all message actions", () => {
  assert.match(messaging, /window\.cvDataSubscribe\('message_threads'/);
  assert.match(messaging, /window\.cvDataSubscribe\('thread_messages'/);
  assert.match(messaging, /api\.request\('cv_social_open_thread'/);
  assert.match(messaging, /api\.request\('cv_social_send_message'/);
});

test("messaging contains no demo contacts or compatibility-route fallback", () => {
  assert.doesNotMatch(messaging, /Dara Chhan|Sophea Sok|Kosal Meng/);
  assert.doesNotMatch(messaging, /\/api\/compat/);
});
