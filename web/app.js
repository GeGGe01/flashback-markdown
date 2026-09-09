import { convertMarkdown } from "../src/converter.js";

const input = document.querySelector("#input");
const output = document.querySelector("#output");
const warnings = document.querySelector("#warnings");
const count = document.querySelector("#warning-count");

function render() {
  const result = convertMarkdown(input.value);
  output.value = result.output;
  warnings.replaceChildren();
  count.textContent = String(result.warnings.length);

  for (const w of result.warnings) {
    const li = document.createElement("li");
    li.textContent = `Rad ${w.line}: ${w.message}`;
    warnings.appendChild(li);
  }
}

input.addEventListener("input", render);

document.querySelector("#copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
});

document.querySelector("#clear").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

input.value = `# Exempel

**Fet text**, *kursiv text* och [en länk](https://www.flashback.org/).

> Ett citat.

- punkt ett
- punkt två

\`\`\`text
kod som ska bli Flashback-BBCode
\`\`\`
`;
render();
