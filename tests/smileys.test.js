import test from "node:test";
import assert from "node:assert/strict";
import { FLASHBACK_SMILEYS } from "../src/smileys.js";
import { renderBBCode } from "../src/preview.js";

const EXPECTED_CODES = [
  ":)", ":(", ":o", ":|", ";)", ":'(", ":p", ":D",
  ":lol:", ":eek:", ":unsure:", ":thumbsup:", ":angry:", ":devil:", ":krafse:", ":sick19:",
  ":thumbsdown:", ":beer:", ":skamsen:", ":sad44:", ":evilgrin39:", ":yes:", ":whoco5:", ":sneaky:",
  ":rolleyes:", ":innocent:", ":whistle:", ":cool:", ":confused:", ":w000t:", ":boxing:", ":drunk:",
  ":evilmad:", ":no:", ":rant:", ":sly:",
];

test("registry matches the complete archived Flashback smiley list", () => {
  assert.equal(FLASHBACK_SMILEYS.length, 36);
  assert.deepEqual(FLASHBACK_SMILEYS.map(x => x.code), EXPECTED_CODES);
});

test("ordinary post text auto-renders smiley shortcodes", () => {
  const html = renderBBCode("hej :) :lol: :w000t:");
  assert.equal((html.match(/class=\"fb-smiley\"/g) ?? []).length, 3);

  // Shortcodes may remain in metadata such as title=\":lol:\" for hover/tooltips.
  // What matters is that they no longer survive as visible text nodes.
  const visibleText = html.replace(/<[^>]*>/g, "");
  assert.doesNotMatch(visibleText, /:\)|:lol:|:w000t:/);
});

test("code and noparse keep smiley shortcodes literal", () => {
  const html = renderBBCode("[code]:lol: :w000t:[/code]\n[noparse]:thumbsup:[/noparse]");
  assert.match(html, /:lol:/);
  assert.match(html, /:w000t:/);
  assert.match(html, /:thumbsup:/);
  assert.equal((html.match(/class=\"fb-smiley\"/g) ?? []).length, 0);
});
