const SIMPLE_TAGS = [
  ["b", "**", "**"],
  ["i", "*", "*"],
  ["u", "++", "++"],
  ["highlight", "==", "=="],
];

function replaceSimpleTags(input) {
  let out = input;
  for (const [tag, open, close] of SIMPLE_TAGS) {
    const re = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "gi");
    out = out.replace(re, (_m, body) => `${open}${body}${close}`);
  }
  return out;
}

function convertLists(input) {
  return input
    .replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_m, body) => {
      const items = body.split(/\[\*\]/).map(x => x.trim()).filter(Boolean);
      return items.map((x, i) => `${i + 1}. ${x}`).join("\n");
    })
    .replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_m, body) => {
      const items = body.split(/\[\*\]/).map(x => x.trim()).filter(Boolean);
      return items.map(x => `- ${x}`).join("\n");
    });
}

export function convertBBCode(bbcode) {
  const warnings = [];
  let out = String(bbcode ?? "").replace(/\r\n/g, "\n");

  out = out.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (_m, body) => `\n\`\`\`text\n${body.trim()}\n\`\`\`\n`);
  out = out.replace(/\[noparse\]([\s\S]*?)\[\/noparse\]/gi, (_m, body) => {
    const trimmed = body.trim();
    if (!trimmed.includes("\n")) return `\`${trimmed.replace(/`/g, "\\`")}\``;
    return `\n\`\`\`text\n${trimmed}\n\`\`\`\n`;
  });

  out = out.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_m, url, label) => `[${label}](${url})`);
  out = out.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_m, url) => `<${url}>`);
  out = out.replace(/\[quote(?:=[^\]]+)?\]([\s\S]*?)\[\/quote\]/gi, (_m, body) =>
    body.trim().split("\n").map(line => `> ${line}`).join("\n")
  );
  out = convertLists(out);
  out = out.replace(/\[spoiler(?:=([^\]]+))?\]([\s\S]*?)\[\/spoiler\]/gi, (_m, title, body) =>
    `:::spoiler${title ? ` ${title}` : ""}\n${body.trim()}\n:::`
  );

  out = replaceSimpleTags(out);

  const lossyTags = ["left", "center", "right", "indent", "email"];
  for (const tag of lossyTags) {
    const re = new RegExp(`\\[${tag}(?:=[^\\]]+)?\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "gi");
    out = out.replace(re, (_m, body) => {
      warnings.push({ line: 1, code: "lossy-bbcode-tag", message: `[${tag}] has no native Markdown equivalent; content preserved.` });
      return body;
    });
  }

  const remaining = [...out.matchAll(/\[(\/?[a-z]+)(?:=[^\]]+)?\]/gi)];
  if (remaining.length) {
    warnings.push({ line: 1, code: "unknown-bbcode", message: "Unknown or unsupported BBCode remains in the converted Markdown." });
  }

  return { output: out.trim() + "\n", warnings };
}
