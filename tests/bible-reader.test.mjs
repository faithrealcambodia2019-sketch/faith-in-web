import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const reader = read("../public/faithin-app/assets/faithin-bible.js");
const page = read("../public/faithin-app/bible.html");

test("the Bible reader separates normalized chapter responses from old browser cache entries", () => {
  assert.match(reader, /schema:\s*2/);
  assert.match(page, /faithin-bible\.js\?v=20260902-bible-v2/);
});

test("older valid verse payloads remain readable and are not treated as license errors", () => {
  assert.match(reader, /const hasVerses = Array\.isArray\(data\.items\)/);
  assert.match(reader, /data\.status === 'setup_required'/);
  assert.match(reader, /data\.status === 'publisher_access_required'/);
});

test("missing external links never resolve to the Faith In origin", () => {
  assert.match(reader, /if \(!String\(value \|\| ''\)\.trim\(\)\) return ''/);
});
