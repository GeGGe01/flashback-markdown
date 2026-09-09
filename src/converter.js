const DEFAULT_MOBILE_WIDTH = 46;

const RE = {
  heading: /^(#{1,6})\s+(.+?)\s*$/,
  ul: /^\s*[-+*]\s+(.+)$/,
  ol: /^\s*\d+[.)]\s+(.+)$/,
  quote: /^\s*>\s?(.*)$/,
  hr: /^\s*(?:---+|\*\*\*+|___+)\s*$/,
  fence: /^```([A-Za-z0-9_+-]*)\s*$/,
  image: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g,
  link: /\[([^\]]+)\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g,
  inlineCode: /`([^`\n]+)`/g,
  strike: /~~(.+?)~~/g,
  bold: /\*\*(.+?)\*\*|__(.+?)__/g,
  italicStar: /(?<!\*)\*([^*\n]+?)\*(?!\*)/g,
  italicUnder: /(?<!\w)_([^_\n]+?)_(?!\w)/g,
  htmlU: /<u>(.*?)<\/u>/gi,
  htmlBr: /<br\s*\/?>/gi,
  bbcodeLike: /\[(?:\/?)(?:b|i|u|quote|url|code|noparse|list|spoiler|left|center|right|indent|highlight|email)(?:=[^\]]+)?\]/i,
};

function decodeEntities(s) {
  const map = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
  return s.replace(/&(amp|lt|gt|quot|#39);/g, m => map[m] ?? m);
}

export class FlashbackConverter {
  constructor({ mobileWidth = DEFAULT_MOBILE_WIDTH } = {}) {
    this.mobileWidth = mobileWidth;
    this.warnings = [];
  }

  warn(line, code, message) {
    this.warnings.push({ line, code, message });
  }

  inline(text, lineNo) {
    let s = decodeEntities(text)
      .replace(RE.htmlBr, "\n")
      .replace(RE.htmlU, "[u]$1[/u]");

    s = s.replace(RE.image, (_m, alt, url) => {
      this.warn(lineNo, "image-degraded", "Image converted to labeled URL; [img] is not emitted.");
      return `${alt ? `${alt}: ` : ""}[url=${url}]${url}[/url]`;
    });

    const protectedInline = [];
    s = s.replace(RE.inlineCode, (_m, value) => {
      const token = `\u0000INLINE${protectedInline.length}\u0000`;
      protectedInline.push(`[noparse]${value}[/noparse]`);
      return token;
    });

    s = s.replace(RE.strike, (_m, value) => {
      this.warn(lineNo, "strikethrough-dropped", "Strikethrough preserved as plain text.");
      return value;
    });

    s = s.replace(RE.bold, (_m, a, b) => `[b]${a ?? b}[/b]`);
    s = s.replace(RE.italicStar, "[i]$1[/i]");
    s = s.replace(RE.italicUnder, "[i]$1[/i]");
    s = s.replace(RE.link, (_m, label, url) => `[url=${url}]${label}[/url]`);

    protectedInline.forEach((value, i) => {
      s = s.replace(`\u0000INLINE${i}\u0000`, value);
    });

    return s;
  }

  fence(content, startLine, lang) {
    const body = content.join("\n");
    if (lang) {
      this.warn(startLine, "language-label-dropped", `Language label "${lang}" dropped.`);
    }

    if (RE.bbcodeLike.test(body)) {
      this.warn(startLine, "code-used-noparse", "BBCode-like content detected; using [noparse].");
      return `[noparse]\n${body}\n[/noparse]`;
    }

    content.forEach((line, i) => {
      if (line.length > this.mobileWidth) {
        this.warn(startLine + i, "wide-code-line", `Code line exceeds ~${this.mobileWidth} columns.`);
      }
    });

    return `[code]\n${body}\n[/code]`;
  }

  table(rows, startLine) {
    let parsed = rows.map(raw => raw.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));

    if (
      parsed.length >= 2 &&
      parsed[1].every(c => /^:?-{3,}:?$/.test(c))
    ) {
      parsed.splice(1, 1);
    }

    const width = Math.max(...parsed.map(r => r.length));
    parsed = parsed.map(r => [...r, ...Array(width - r.length).fill("")]);

    const out = parsed.map(row => row.map(c => this.inline(c, startLine)).join("\t"));
    if (out.some(line => line.length > this.mobileWidth)) {
      this.warn(startLine, "wide-table", `Table exceeds ~${this.mobileWidth} columns; verify on mobile.`);
    }
    return `[code]\n${out.join("\n")}\n[/code]`;
  }

  convert(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const raw = lines[i];
      const lineNo = i + 1;

      const fm = raw.match(RE.fence);
      if (fm) {
        const lang = fm[1] || "";
        const block = [];
        i++;
        while (i < lines.length && !RE.fence.test(lines[i])) {
          block.push(lines[i]);
          i++;
        }
        if (i >= lines.length) {
          this.warn(lineNo, "unclosed-fence", "Unclosed code fence; converted to end of input.");
        } else {
          i++;
        }
        out.push(this.fence(block, lineNo, lang));
        continue;
      }

      if (raw.startsWith(":::spoiler")) {
        const title = raw.slice(":::spoiler".length).trim();
        const body = [];
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") {
          body.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        else this.warn(lineNo, "unclosed-spoiler", "Unclosed :::spoiler block.");

        const nested = new FlashbackConverter({ mobileWidth: this.mobileWidth });
        const inner = nested.convert(body.join("\n")).output.trimEnd();
        this.warnings.push(...nested.warnings);
        out.push(`${title ? `[spoiler=${title}]` : "[spoiler]"}\n${inner}\n[/spoiler]`);
        continue;
      }

      const hm = raw.match(RE.heading);
      if (hm) {
        out.push(`[b]${this.inline(hm[2], lineNo)}[/b]`);
        i++;
        continue;
      }

      if (RE.hr.test(raw)) {
        out.push("");
        i++;
        continue;
      }

      if (raw.includes("|") && i + 1 < lines.length && lines[i + 1].includes("|")) {
        const sepCells = lines[i + 1].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        if (sepCells.length && sepCells.every(c => /^:?-{3,}:?$/.test(c))) {
          const rows = [raw, lines[i + 1]];
          i += 2;
          while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
            rows.push(lines[i]);
            i++;
          }
          out.push(this.table(rows, lineNo));
          continue;
        }
      }

      if (RE.quote.test(raw)) {
        const q = [];
        while (i < lines.length) {
          const qm = lines[i].match(RE.quote);
          if (!qm) break;
          q.push(this.inline(qm[1], i + 1));
          i++;
        }
        out.push(`[quote]\n${q.join("\n")}\n[/quote]`);
        continue;
      }

      if (RE.ul.test(raw)) {
        const items = [];
        while (i < lines.length) {
          const m = lines[i].match(RE.ul);
          if (!m) break;
          items.push(this.inline(m[1], i + 1));
          i++;
        }
        out.push(`[list]\n${items.map(x => `[*]${x}`).join("\n")}\n[/list]`);
        continue;
      }

      if (RE.ol.test(raw)) {
        const items = [];
        while (i < lines.length) {
          const m = lines[i].match(RE.ol);
          if (!m) break;
          items.push(this.inline(m[1], i + 1));
          i++;
        }
        out.push(`[list=1]\n${items.map(x => `[*]${x}`).join("\n")}\n[/list]`);
        continue;
      }

      if (!raw.trim()) {
        out.push("");
        i++;
        continue;
      }

      out.push(this.inline(raw, lineNo));
      i++;
    }

    const cleaned = [];
    let blank = false;
    for (const line of out) {
      if (line === "") {
        if (!blank) cleaned.push(line);
        blank = true;
      } else {
        cleaned.push(line);
        blank = false;
      }
    }

    return {
      output: cleaned.join("\n").trim() + "\n",
      warnings: this.warnings,
    };
  }
}

export function convertMarkdown(markdown, options = {}) {
  return new FlashbackConverter(options).convert(markdown);
}
