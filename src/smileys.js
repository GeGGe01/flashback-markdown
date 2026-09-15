// Canonical Flashback smiley shortcode registry.
// Source reference: archived Flashback "Standard Smilies" list from 2024.
// `glyph` is a local preview approximation; the source shortcode remains authoritative.
export const FLASHBACK_SMILEYS = [
  { code: ":)", glyph: "🙂", label: "Smile" },
  { code: ":(", glyph: "🙁", label: "Sad" },
  { code: ":o", glyph: "😮", label: "Ohmy" },
  { code: ":|", glyph: "😐", label: "Noexpression" },
  { code: ";)", glyph: "😉", label: "Wink" },
  { code: ":'(", glyph: "😢", label: "Cry" },
  { code: ":p", glyph: "😛", label: "Tongue" },
  { code: ":D", glyph: "😁", label: "Grin" },
  { code: ":lol:", glyph: "😆", label: "Laugh" },
  { code: ":eek:", glyph: "😳", label: "EEK" },
  { code: ":unsure:", glyph: "😕", label: "Unsure" },
  { code: ":thumbsup:", glyph: "👍", label: "Thumbsup" },
  { code: ":angry:", glyph: "😠", label: "Angry" },
  { code: ":devil:", glyph: "😈", label: "Devil" },
  { code: ":krafse:", glyph: "😵‍💫", label: "Krafse" },
  { code: ":sick19:", glyph: "🤢", label: "Sick19" },
  { code: ":thumbsdown:", glyph: "👎", label: "Thumbsdown" },
  { code: ":beer:", glyph: "🍻", label: "Beer" },
  { code: ":skamsen:", glyph: "🫣", label: "Skamsen" },
  { code: ":sad44:", glyph: "😭", label: "Sad44" },
  { code: ":evilgrin39:", glyph: "😼", label: "Evilgrin39" },
  { code: ":yes:", glyph: "🙂", label: "Yes" },
  { code: ":whoco5:", glyph: "🤷", label: "Whoco5" },
  { code: ":sneaky:", glyph: "😏", label: "Sneaky" },
  { code: ":rolleyes:", glyph: "🙄", label: "Rolleyes" },
  { code: ":innocent:", glyph: "😇", label: "Innocent" },
  { code: ":whistle:", glyph: "😗", label: "Whistle" },
  { code: ":cool:", glyph: "😎", label: "Cool" },
  { code: ":confused:", glyph: "🤔", label: "Confused" },
  { code: ":w000t:", glyph: "🤯", label: "W000t" },
  { code: ":boxing:", glyph: "🥊", label: "Boxing" },
  { code: ":drunk:", glyph: "🥴", label: "Drunk" },
  { code: ":evilmad:", glyph: "🤬", label: "Evilmad" },
  { code: ":no:", glyph: "🙅", label: "No" },
  { code: ":rant:", glyph: "😡", label: "Rant" },
  { code: ":sly:", glyph: "😏", label: "Sly" },
];

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const FLASHBACK_SMILEY_PATTERN = new RegExp(
  FLASHBACK_SMILEYS
    .map(({ code }) => code)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|"),
  "g",
);

export const FLASHBACK_SMILEY_BY_CODE = new Map(
  FLASHBACK_SMILEYS.map(smiley => [smiley.code, smiley]),
);
