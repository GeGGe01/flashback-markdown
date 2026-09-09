---
name: flashback-markdown
description: >
  Convert Markdown drafts into Flashback-specific BBCode using the canonical JavaScript
  converter. Trigger when the user asks to format text for Flashback, convert Markdown to
  Flashback BBCode, or produce copy-paste-ready Flashback markup.
---

# Flashback Markdown

Use the repository converter rather than manually inventing another conversion path.

Canonical implementation:

[src/converter.js](../../src/converter.js)

CLI:

[bin/cli.js](../../bin/cli.js)

Bash convenience wrapper:

[bin/md2fb](../../bin/md2fb)

Browser UI:

[web/index.html](../../web/index.html)

## Workflow

1. Preserve the operator's prose.
2. Convert through the canonical converter.
3. Review warnings.
4. Return copy-paste-ready Flashback BBCode.
5. Improve the converter when recurring false positives or formatting defects are found.

## Design rules

- Optimize for Flashback/mobile readability.
- Markdown headings become bold lines.
- Markdown bold/italic convert to supported BBCode.
- Inline code becomes noparse semantics.
- Fenced code becomes code blocks unless BBCode-like content requires noparse.
- Tables become TAB-separated code blocks.
- Images degrade to labeled links.
- Unsupported formatting is not invented.
- Warnings are preferable to silent destructive rewrites.

## Completion

Do not consider a conversion complete until warnings have been inspected.
