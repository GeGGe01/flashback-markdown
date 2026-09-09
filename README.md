# flashback-markdown

Markdown → Flashback-specific BBCode.

One canonical JavaScript converter powers:

- browser UI
- Node CLI
- Bash wrapper
- reusable agent skill

No runtime dependencies.

## Browser

Static files live under web/ and are deployable to GitHub Pages.

## CLI

```text
node bin/cli.js draft.md --warnings
```

or:

```text
bin/md2fb draft.md
```

## Tests

```text
npm test
```

## Skill

The reusable skill lives under skills/flashback-markdown/.
