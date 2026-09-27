# Flashback smiley assets

This directory is the vendored home for Flashback's classic GIF smileys.

The canonical shortcode -> filename -> upstream URL mapping lives in
`src/smileys.js`. The editor always inserts the shortcode. Preview and the
smiley picker prefer the local GIF here and fall back to the registry's Unicode
approximation when a GIF is missing.

To populate or refresh the vendored GIFs from Flashback:

```sh
./scripts/vendor-smileys.sh
```

The script reads the canonical registry instead of maintaining a second asset
list. Review the downloaded files, then commit them under this directory.
