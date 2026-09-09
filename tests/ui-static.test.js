import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
const pages = fs.readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

test("Rensa is an explicit button and is wired", () => {
  assert.match(html, /<button[^>]*type="button"[^>]*id="clear"[^>]*>Rensa<\/button>/);
  assert.match(app, /querySelector\("#clear"\)\.addEventListener\("click"/);
  assert.match(app, /clearTimeout\(autosaveTimer\)/);
});

test("Pages publishes every referenced stylesheet", () => {
  assert.match(html, /toolbar\.css/);
  assert.match(pages, /cp web\/toolbar\.css _site\/toolbar\.css/);
});

test("Pages cache-busts static assets by commit SHA", () => {
  assert.match(pages, /GITHUB_SHA/);
  assert.match(pages, /app\.js\?v=/);
});
