#!/usr/bin/env node
import fs from "node:fs";
import { convertMarkdown } from "../src/converter.js";

const args = process.argv.slice(2);
let inputPath = null;
let outputPath = null;
let strict = false;
let warnings = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-o" || a === "--output") outputPath = args[++i];
  else if (a === "--strict") strict = true;
  else if (a === "--warnings") warnings = true;
  else if (!inputPath) inputPath = a;
}

const source = inputPath
  ? fs.readFileSync(inputPath, "utf8")
  : fs.readFileSync(0, "utf8");

const result = convertMarkdown(source);

if (outputPath) fs.writeFileSync(outputPath, result.output, "utf8");
else process.stdout.write(result.output);

if (warnings || strict) {
  for (const w of result.warnings) {
    console.error(`line ${w.line}: [${w.code}] ${w.message}`);
  }
}
if (strict && result.warnings.length) process.exit(1);
