import { FLASHBACK_SMILEYS } from "../src/smileys.js";

const popover = document.querySelector(".smiley-popover");

function preferAsset(img, fallback) {
  const showAsset = () => {
    img.hidden = false;
    fallback.hidden = true;
  };
  const showFallback = () => {
    img.hidden = true;
    fallback.hidden = false;
  };

  img.addEventListener("load", showAsset, { once: true });
  img.addEventListener("error", showFallback, { once: true });
  img.src = img.dataset.src;

  if (img.complete) {
    if (img.naturalWidth > 0) showAsset();
    else showFallback();
  }
}

if (popover) {
  const heading = document.createElement("div");
  heading.className = "smiley-popover-heading";
  heading.textContent = "Standard Smilies";

  const help = document.createElement("div");
  help.className = "smiley-popover-help";
  help.textContent = "Klicka på en smilie för att infoga den vid markören.";

  const grid = document.createElement("div");
  grid.className = "smiley-grid";

  for (const smiley of FLASHBACK_SMILEYS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "smiley-option";
    button.dataset.smiley = smiley.code;
    button.title = smiley.label + " — " + smiley.code;
    button.setAttribute("aria-label", smiley.label + ": " + smiley.code);

    const visual = document.createElement("span");
    visual.className = "smiley-option-visual";
    visual.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.className = "smiley-option-img";
    img.alt = "";
    img.hidden = true;
    img.dataset.src = smiley.asset;

    const fallback = document.createElement("span");
    fallback.className = "smiley-option-glyph";
    fallback.textContent = smiley.glyph;

    const code = document.createElement("span");
    code.className = "smiley-option-code";
    code.textContent = smiley.code;

    visual.append(img, fallback);
    button.append(visual, code);
    grid.append(button);
    preferAsset(img, fallback);
  }

  popover.replaceChildren(heading, help, grid);
}
