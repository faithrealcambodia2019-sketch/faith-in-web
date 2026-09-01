import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const home = read("../public/faithin-app/index.html");
const css = read("../public/faithin-app/assets/faithin.css");

test("the home composer keeps every existing action", () => {
  assert.match(home, /class="fi-composer-actions [^"]*"/);
  for (const label of ["Blessing", "Photo", "Video", "Prayer", "Article"]) {
    assert.match(home, new RegExp(`>${label}</button>`));
  }
});

test("the five composer actions remain visible on narrow phones", () => {
  assert.match(css, /@media \(max-width:420px\)/);
  assert.match(css, /\.fi-composer-actions\{[^}]*display:grid;[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/s);
  assert.match(css, /\.fi-composer-actions \.action-btn\{[^}]*min-width:0;/s);
});
