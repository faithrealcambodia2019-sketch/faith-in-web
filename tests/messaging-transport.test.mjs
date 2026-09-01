import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../public/faithin-app/assets/faithin-messaging.js", import.meta.url),
  "utf8",
);
const start = source.indexOf("  async function callApi");
const end = source.indexOf("\n\n  // Clear legacy", start);

if (start < 0 || end < 0) throw new Error("Messaging transport could not be found.");
const transportSource = `${source.slice(start, end)}\nwindow.testCallApi = callApi;`;

function transportContext({ client, server }) {
  const calls = [];
  const window = { cvDataRequest: client };
  const context = {
    window,
    fetch: async (...args) => {
      calls.push(args);
      return server(...args);
    },
  };
  vm.runInNewContext(transportSource, context);
  return { callApi: window.testCallApi, calls };
}

test("messaging uses Firebase before the optional compatibility server", async () => {
  const expected = { items: [] };
  const { callApi, calls } = transportContext({
    client: async () => expected,
    server: async () => {
      throw new Error("The server fallback must not run.");
    },
  });

  assert.deepEqual(await callApi("cv_social_get_message_threads"), expected);
  assert.equal(calls.length, 0);
});

test("messaging retains the optional server fallback", async () => {
  const expected = { items: [{ id: "thread-1" }] };
  const { callApi, calls } = transportContext({
    client: async () => {
      throw new Error("Firebase unavailable");
    },
    server: async () => ({
      ok: true,
      json: async () => ({ success: true, data: expected }),
    }),
  });

  assert.deepEqual(await callApi("cv_social_get_message_threads"), expected);
  assert.equal(calls.length, 1);
});
