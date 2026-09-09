# Editor prototype

The project is now a Flashback-oriented editor sandbox rather than only a one-way Markdown converter.

Version 1 editor scope:

- Markdown ↔ Flashback BBCode;
- Flashback-style formatting toolbar;
- selection-aware formatting;
- unordered and ordered lists;
- underline and highlight round-trip extensions;
- local browser drafts with autosave;
- forum and PM character-count profiles;
- PM warning threshold at 15,000 characters;
- desktop and mobile preview modes;
- warning-first handling of lossy or ambiguous conversions.

Local drafts are stored in IndexedDB and therefore remain device/browser local. No server-side draft sync is part of this prototype.

The browser UI is intentionally derived from Flashback's editor interaction model, while remaining a separate implementation and adding capabilities absent from the original editor.
