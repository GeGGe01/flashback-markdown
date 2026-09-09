import test from "node:test";
import assert from "node:assert/strict";
import { renderBBCode } from "../src/preview.js";

test("confirmed style tags render", () => {
  const html = renderBBCode("[b]fet[/b] [i]kursiv[/i] [u]under[/u] [highlight]mark[/highlight]");
  assert.match(html, /<strong>fet<\/strong>/);
  assert.match(html, /<em>kursiv<\/em>/);
  assert.match(html, /<u>under<\/u>/);
  assert.match(html, /<mark>mark<\/mark>/);
});

test("code preserves BBCode literally", () => {
  const html = renderBBCode("[code][b]ska ej bli fet[/b][/code]");
  assert.match(html, /<pre class="fb-code"><code>\[b\]ska ej bli fet\[\/b\]<\/code><\/pre>/);
  assert.doesNotMatch(html, /<strong>/);
});

test("noparse preserves tags literally", () => {
  const html = renderBBCode("[noparse][b]literal[/b][/noparse]");
  assert.match(html, /\[b\]literal\[\/b\]/);
  assert.doesNotMatch(html, /<strong>/);
});

test("list variants render", () => {
  assert.match(renderBBCode("[list][*]x[/list]"), /<ul>/);
  assert.match(renderBBCode("[list=1][*]x[/list]"), /<ol>/);
  assert.match(renderBBCode("[list=a][*]x[/list]"), /<ol type="a">/);
  assert.match(renderBBCode("[list=i][*]x[/list]"), /<ol type="i">/);
});

test("alignment and indent render", () => {
  const html = renderBBCode("[left]L[/left][center]C[/center][right]R[/right][indent]I[/indent]");
  assert.match(html, /fb-align-left/);
  assert.match(html, /fb-align-center/);
  assert.match(html, /fb-align-right/);
  assert.match(html, /fb-indent/);
});

test("unsupported candidate tags remain literal", () => {
  const html = renderBBCode("[color=red]röd[/color] [size=4]stor[/size] [sub]x[/sub] [hr]");
  assert.match(html, /\[color=red\]röd\[\/color\]/);
  assert.match(html, /\[size=4\]stor\[\/size\]/);
  assert.match(html, /\[sub\]x\[\/sub\]/);
  assert.match(html, /\[hr\]/);
});
