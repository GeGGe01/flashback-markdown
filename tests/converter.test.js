import test from "node:test";
import assert from "node:assert/strict";
import { convertMarkdown } from "../src/converter.js";

test("heading and emphasis", () => {
  const { output } = convertMarkdown("# Rubrik\n\n**fet** och *kursiv*");
  assert.match(output, /\[b\]Rubrik\[\/b\]/);
  assert.match(output, /\[b\]fet\[\/b\]/);
  assert.match(output, /\[i\]kursiv\[\/i\]/);
});

test("link", () => {
  const { output } = convertMarkdown("[Flashback](https://www.flashback.org/)");
  assert.equal(output.trim(), "[url=https://www.flashback.org/]Flashback[/url]");
});

test("inline code -> noparse", () => {
  const { output } = convertMarkdown("Kör `foo --bar`.");
  assert.match(output, /\[noparse\]foo --bar\[\/noparse\]/);
});

test("fenced code -> code", () => {
  const { output } = convertMarkdown("```text\nhello\n```");
  assert.match(output, /\[code\]\nhello\n\[\/code\]/);
});

test("bbcode-like fenced content stays inside code", () => {
  const r = convertMarkdown("```\n[b]literal[/b]\n```");
  assert.match(r.output, /\[code\]\n\[b\]literal\[\/b\]\n\[\/code\]/);
  assert.ok(!r.warnings.some(w => w.code === "code-used-noparse"));
});

test("markdown table -> tabbed code block", () => {
  const { output } = convertMarkdown("| A | B |\n| --- | --- |\n| 1 | 2 |");
  assert.match(output, /A\tB/);
  assert.match(output, /1\t2/);
});

test("unsupported horizontal rule is omitted with warning", () => {
  const r = convertMarkdown("före\n\n---\n\nefter");
  assert.doesNotMatch(r.output, /\[hr\]/i);
  assert.ok(r.warnings.some(w => w.code === "horizontal-rule-dropped"));
});
