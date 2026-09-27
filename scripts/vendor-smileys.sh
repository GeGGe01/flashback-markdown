#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT}/assets/smilies"
mkdir -p "${DEST}"
cd "${ROOT}"

node --input-type=module <<'NODE' |
import { FLASHBACK_SMILEYS } from "./src/smileys.js";
for (const smiley of FLASHBACK_SMILEYS) {
  process.stdout.write(smiley.source + "\t" + smiley.filename + "\n");
}
NODE
while IFS=$'\t' read -r url filename; do
  printf 'fetch %s -> %s\n' "$url" "$filename"
  curl --fail --location --retry 3 --retry-delay 1     --output "${DEST}/${filename}.tmp" "$url"
  mv "${DEST}/${filename}.tmp" "${DEST}/${filename}"
done

printf 'vendored %s smileys into %s\n' "$(find "${DEST}" -maxdepth 1 -type f -name '*.gif' | wc -l)" "${DEST}"
