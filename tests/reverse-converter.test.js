import test from "node:test";
import assert from "node:assert/strict";
import { convertBBCode } from "../src/reverse-converter.js";
import { convertMarkdown } from "../src/converter.js";

test("reverse bold italic underline highlight", () => {
  const { output } = convertBBCode("[b]fet[/b] [i]kursiv[/i] [u]under[/u] [highlight]mark[/highlight]");
  assert.equal(output.trim(), "**fet** *kursiv* ++under++ ==mark==");
});

test("ordered list reverses", () => {
  const { output } = convertBBCode("[list=1]\n[*]ett\n[*]två\n[/list]");
  assert.match(output, /^1\. ett\n2\. två/m);
});

test("core inline primitives round trip", () => {
  const source = "**fet** *kursiv* ++under++ ==mark==";
  const bb = convertMarkdown(source).output;
  const md = convertBBCode(bb).output;
  assert.equal(md.trim(), source);
});

test("lossy alignment warns", () => {
  const result = convertBBCode("[center]text[/center]");
  assert.equal(result.output.trim(), "text");
  assert.ok(result.warnings.some(w => w.code === "lossy-bbcode-tag"));
});
