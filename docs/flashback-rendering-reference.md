# Flashback rendering reference

Empirical reference derived from live Flashback rendering tests supplied by the operator.

This document records observed behavior, not a theoretical BBCode feature list.

## Confirmed rendering

The following render as active formatting/features in the supplied test posts:

- `[b]...[/b]`
- `[i]...[/i]`
- `[u]...[/u]`
- `[highlight]...[/highlight]`
- nesting of supported inline style tags
- `[left]...[/left]`
- `[center]...[/center]`
- `[right]...[/right]`
- `[indent]...[/indent]`
- `[list]` with `[*]`
- `[list=1]` with `[*]`
- `[list=a]` with `[*]`
- `[list=i]` with `[*]`
- `[url]...[/url]`
- `[url=https://...]label[/url]`
- `[email]...[/email]`
- `[quote]...[/quote]`
- attributed quote rendering where the parser preserves the quote markup
- `[spoiler]...[/spoiler]`
- `[spoiler=titel]...[/spoiler]` renders as a spoiler; the supplied screenshots do not demonstrate a distinct visible title
- `[code]...[/code]`
- `[noparse]...[/noparse]`

## Important code behavior

The rendering test demonstrates that supported BBCode inside `[code]` is displayed literally rather than recursively formatted.

Example source:

```text
[code]ren kod, [b]ska ej bli fet[/b][/code]
```

The visible result keeps the `[b]` markup literal inside the code box.

Tabs and multiple spaces are preserved in code. Code uses a monospaced presentation.

The exact glyph widths are not uniform for every Unicode symbol, so tabular alignment should be validated against real content rather than assumed from character count alone.

## Smiley autoconversion

The supplied live rendering shows textual smiley sequences being converted in ordinary post text.

This is a separate Flashback parser behavior and should not be confused with BBCode rendering.

Mathematical/textual strings containing smiley-like sequences may therefore be a formatting hazard.

The local preview does not yet claim pixel-identical smiley emulation.

## Candidate tags that remained literal in the supplied test

The screenshots show these as source text rather than active rendering:

- `[s]`
- `[strike]`
- `[color=...]`
- `[size=...]`
- `[font=...]`
- `[sub]`
- `[sup]`
- `[hr]`
- `[table]`, `[tr]`, `[td]`
- `[icode]`
- `[code=php]`
- `[php]`
- `[tex]`
- `[math]`
- `[latex]`
- `[img]`

Converters MUST NOT invent support for these based only on generic BBCode expectations.

## Quote/parser caveat

Some nested quote cases are absent from the supplied rendered posts because Flashback's parser removes nested quote material in the posting/quoting flow.

Therefore nested-quote behavior must be separated into two questions:

1. what markup the editor/converter emits;
2. what Flashback's parser preserves before final rendering.

The preview should not infer unsupported nested-quote semantics from missing rendered examples.

## Preview target

The local preview should model the confirmed semantic rendering closely enough to catch formatting mistakes.

It is not a claim of pixel-perfect parity with Flashback's server renderer. Where the live test and generic BBCode assumptions disagree, the live test wins.
