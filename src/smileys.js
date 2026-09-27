// Canonical Flashback smiley registry.
// Source: archived Flashback "Smilie-lista" (2024-06-06) plus the live
// static.flashback.org asset paths captured in that page.
//
// code = editor/source contract.
// asset = vendored path preferred by preview/picker when present.
// source = corresponding Flashback-hosted GIF for later vendoring.
// glyph = fallback only when the GIF is unavailable locally.
const ASSET_ROOT = "./assets/smilies/";
const SOURCE_ROOT = "https://static.flashback.org/img/smilies2/";

function smiley(code, filename, glyph, label) {
  return {
    code,
    filename,
    asset: ASSET_ROOT + filename,
    source: SOURCE_ROOT + filename,
    glyph,
    label,
  };
}

export const FLASHBACK_SMILEYS = [
  smiley(":)", "smile1.gif", "🙂", "Smile"),
  smiley(":(", "sad.gif", "🙁", "Sad"),
  smiley(":o", "ohmy.gif", "😮", "Ohmy"),
  smiley(":|", "noexpression.gif", "😐", "Noexpression"),
  smiley(";)", "wink.gif", "😉", "Whink"),
  smiley(":'(", "cry.gif", "😢", "Cry"),
  smiley(":p", "tongue.gif", "😛", "Tongue"),
  smiley(":D", "grin.gif", "😁", "Grin"),
  smiley(":lol:", "laugh.gif", "😆", "Laugh"),
  smiley(":eek:", "w00t.gif", "😳", "EEK!"),
  smiley(":unsure:", "unsure.gif", "😕", "Unsure"),
  smiley(":thumbsup:", "thumbsup.gif", "👍", "Thumbsup"),
  smiley(":angry:", "angry.gif", "😠", "Angry"),
  smiley(":devil:", "devil.gif", "😈", "Devil"),
  smiley(":krafse:", "krafse.gif", "😵‍💫", "Krafse"),
  smiley(":sick19:", "sick19.gif", "🤢", "Sick19"),
  smiley(":thumbsdown:", "thumbsdown.gif", "👎", "Thumbsdown"),
  smiley(":beer:", "beer2.gif", "🍻", "Beer"),
  smiley(":skamsen:", "skamsen.gif", "🫣", "Skamsen"),
  smiley(":sad44:", "sad44.gif", "😭", "Sad44"),
  smiley(":evilgrin39:", "evilgrin39.gif", "😼", "Evilgrin39"),
  smiley(":yes:", "yes.gif", "🙂", "Yes"),
  smiley(":whoco5:", "whoco5.gif", "🤷", "Whoco5"),
  smiley(":sneaky:", "sneaky.gif", "😏", "Sneaky"),
  smiley(":rolleyes:", "rolleyes.gif", "🙄", "Rolleyes"),
  smiley(":innocent:", "innocent.gif", "😇", "Innocent"),
  smiley(":whistle:", "whistle.gif", "😗", "Whistle"),
  smiley(":cool:", "cool2.gif", "😎", "Cool"),
  smiley(":confused:", "confused.gif", "🤔", "Confused"),
  smiley(":w000t:", "w000t.gif", "🤯", "W000t"),
  smiley(":boxing:", "boxing.gif", "🥊", "Boxing"),
  smiley(":drunk:", "drunk.gif", "🥴", "Drunk"),
  smiley(":evilmad:", "evilmad.gif", "🤬", "Evilmad"),
  smiley(":no:", "no.gif", "🙅", "No"),
  smiley(":rant:", "rant.gif", "😡", "Rant"),
  smiley(":sly:", "sly.gif", "😏", "Sly"),
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
