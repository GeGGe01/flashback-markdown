function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderBBCode(bbcode) {
  let html = escapeHtml(bbcode ?? "");
  const simple = [
    ["b", "strong"],
    ["i", "em"],
    ["u", "u"],
    ["highlight", "mark"],
  ];

  for (const [tag, element] of simple) {
    const re = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "gi");
    html = html.replace(re, `<${element}>$1</${element}>`);
  }

  html = html
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_m, url, label) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    .replace(/\[quote(?:=[^\]]+)?\]([\s\S]*?)\[\/quote\]/gi, "<blockquote>$1</blockquote>")
    .replace(/\[spoiler(?:=([^\]]+))?\]([\s\S]*?)\[\/spoiler\]/gi, (_m, title, body) => `<details><summary>${title ? escapeHtml(title) : "Spoiler"}</summary><div>${body}</div></details>`)
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "<pre><code>$1</code></pre>")
    .replace(/\[noparse\]([\s\S]*?)\[\/noparse\]/gi, "<code>$1</code>");

  html = html.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_m, body) => {
    const items = body.split(/\[\*\]/).map(x => x.trim()).filter(Boolean);
    return `<ol>${items.map(x => `<li>${x}</li>`).join("")}</ol>`;
  });
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_m, body) => {
    const items = body.split(/\[\*\]/).map(x => x.trim()).filter(Boolean);
    return `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`;
  });

  return html.replace(/\n/g, "<br>");
}
