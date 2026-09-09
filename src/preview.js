function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderList(body, type) {
  const items = body.split(/\[\*\]/).map(x => x.trim()).filter(Boolean);
  const tag = type === "bullet" ? "ul" : "ol";
  const attr = type === "a" ? ' type="a"' : type === "i" ? ' type="i"' : "";
  return `<${tag}${attr}>${items.map(x => `<li>${x}</li>`).join("")}</${tag}>`;
}

function renderQuote(attr, body) {
  const header = attr ? `<div class="fb-quote-head">Ursprungligen postat av <strong>${escapeHtml(attr)}</strong></div>` : `<div class="fb-quote-label">Citat:</div>`;
  return `${header}<blockquote class="fb-quote">${body}</blockquote>`;
}

function protectLiteralBlocks(input) {
  const blocks = [];
  const protectedHtml = input
    .replace(/\[noparse\]([\s\S]*?)\[\/noparse\]/gi, (_m, body) => {
      const token = `\u0000FBLOCK${blocks.length}\u0000`;
      blocks.push(`<span class="fb-noparse">${escapeHtml(body)}</span>`);
      return token;
    })
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (_m, body) => {
      const token = `\u0000FBLOCK${blocks.length}\u0000`;
      blocks.push(`<div class="fb-code-label">Kod:</div><pre class="fb-code"><code>${escapeHtml(body.replace(/^\n|\n$/g, ""))}</code></pre>`);
      return token;
    });
  return { protectedHtml, blocks };
}

export function renderBBCode(bbcode) {
  const { protectedHtml, blocks } = protectLiteralBlocks(String(bbcode ?? ""));
  let html = escapeHtml(protectedHtml);

  // Empirically confirmed style tags.
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

  // Alignment/indent tags are confirmed by the rendering test.
  html = html
    .replace(/\[left\]([\s\S]*?)\[\/left\]/gi, '<div class="fb-align-left">$1</div>')
    .replace(/\[center\]([\s\S]*?)\[\/center\]/gi, '<div class="fb-align-center">$1</div>')
    .replace(/\[right\]([\s\S]*?)\[\/right\]/gi, '<div class="fb-align-right">$1</div>')
    .replace(/\[indent\]([\s\S]*?)\[\/indent\]/gi, '<div class="fb-indent">$1</div>');

  // Links/email confirmed. Bare [url] is deliberately handled as a link too.
  html = html
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_m, url, label) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_m, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`)
    .replace(/\[email\]([\s\S]*?)\[\/email\]/gi, (_m, address) => `<a href="mailto:${escapeHtml(address)}">${address}</a>`);

  // Quotes. Flashback's own parser may strip nested quote structures before the final post
  // reaches the renderer; this preview models the markup that survives into content.
  html = html.replace(/\[quote=([^\]]+)\]([\s\S]*?)\[\/quote\]/gi, (_m, attr, body) => renderQuote(attr, body));
  html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (_m, body) => renderQuote("", body));

  html = html
    .replace(/\[spoiler(?:=([^\]]+))?\]([\s\S]*?)\[\/spoiler\]/gi, (_m, _title, body) => `<details class="fb-spoiler"><summary>Spoiler <span aria-hidden="true">◉</span></summary><div>${body}</div></details>`);

  html = html.replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, (_m, body) => renderList(body, "1"));
  html = html.replace(/\[list=a\]([\s\S]*?)\[\/list\]/gi, (_m, body) => renderList(body, "a"));
  html = html.replace(/\[list=i\]([\s\S]*?)\[\/list\]/gi, (_m, body) => renderList(body, "i"));
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (_m, body) => renderList(body, "bullet"));

  // Restore literal/code blocks after all BBCode transformations. This is important:
  // the empirical Flashback render shows [b] inside [code] remains literal.
  html = html.replace(/\u0000FBLOCK(\d+)\u0000/g, (_m, n) => blocks[Number(n)] ?? "");

  return html.replace(/\n/g, "<br>");
}
