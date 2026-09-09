# Round-trip contract

The converter aims for deterministic round trips where Markdown has a natural equivalent and warnings where it does not.

Core mappings:

- bold: `**text**` ↔ `[b]text[/b]`
- italic: `*text*` ↔ `[i]text[/i]`
- underline extension: `++text++` ↔ `[u]text[/u]`
- highlight extension: `==text==` ↔ `[highlight]text[/highlight]`
- unordered lists ↔ `[list]`
- ordered lists ↔ `[list=1]`
- Markdown links ↔ `[url=...]...[/url]`
- blockquotes ↔ `[quote]`
- fenced code ↔ `[code]`
- spoiler extension blocks ↔ `[spoiler]`

BBCode without a useful Markdown equivalent must preserve readable content and emit a warning rather than silently inventing semantics.
