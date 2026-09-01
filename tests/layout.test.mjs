import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const home = fs.readFileSync(
  new URL("../public/faithin-app/index.html", import.meta.url),
  "utf8",
);
const styles = fs.readFileSync(
  new URL("../public/faithin-app/assets/faithin.css", import.meta.url),
  "utf8",
);

test("mobile composer keeps every action in a five-column responsive row", () => {
  assert.match(home, /class="fi-composer-actions[^\"]*"/);
  for (const label of ["Blessing", "Photo", "Video", "Prayer", "Article"]) {
    assert.match(home, new RegExp(`>${label}<`));
  }
  assert.match(styles, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media \(max-width: 420px\)/);
});
