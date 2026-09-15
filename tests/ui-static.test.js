import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../web/index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../web/app.js", import.meta.url), "utf8");
const pages = fs.readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

test("Rensa is an explicit button and is wired", () => {
  assert.match(html, /<button(?=[^>]*\btype="button")(?=[^>]*\bid="clear")[^>]*>Rensa<\/button>/);
  assert.match(app, /querySelector\("#clear"\)\.addEventListener\("click"/);
  assert.match(app, /clearTimeout\(autosaveTimer\)/);
});

test("Pages publishes every referenced stylesheet", () => {
  assert.match(html, /toolbar\.css/);
  assert.match(pages, /cp web\/toolbar\.css _site\/toolbar\.css/);
});

test("smiley picker has one canonical source", () => {
  assert.match(html, /<div class="smiley-popover" aria-label="Smilies"><\/div>/);
  assert.doesNotMatch(html, /data-smiley=/);
  assert.match(html, /smileys-ui\.js/);
});

test("Pages cache-busts entry assets and imported module graph", () => {
  assert.match(pages, /GITHUB_SHA/);
  assert.match(pages, /app\.js\?v=/);
  assert.match(pages, /smileys-ui\.js\?v=/);
  assert.match(pages, /src\/converter\.js\?v=/);
  assert.match(pages, /src\/reverse-converter\.js\?v=/);
  assert.match(pages, /src\/preview\.js\?v=/);
  assert.match(pages, /src\/smileys\.js\?v=/);
  assert.match(pages, /\.\/smileys\.js\?v=/);
});
