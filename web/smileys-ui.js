import { FLASHBACK_SMILEYS } from "../src/smileys.js";

const popover = document.querySelector(".smiley-popover");

if (popover) {
  const heading = document.createElement("div");
  heading.className = "smiley-popover-heading";
  heading.textContent = "Standard Smilies";

  const grid = document.createElement("div");
  grid.className = "smiley-grid";

  for (const smiley of FLASHBACK_SMILEYS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "smiley-option";
    button.dataset.smiley = smiley.code;
    button.title = `${smiley.label} — ${smiley.code}`;
    button.setAttribute("aria-label", `${smiley.label}: ${smiley.code}`);

    const glyph = document.createElement("span");
    glyph.className = "smiley-option-glyph";
    glyph.textContent = smiley.glyph;
    glyph.setAttribute("aria-hidden", "true");

    const code = document.createElement("span");
    code.className = "smiley-option-code";
    code.textContent = smiley.code;

    button.append(glyph, code);
    grid.append(button);
  }

  popover.replaceChildren(heading, grid);
}
