import { convertMarkdown } from "../src/converter.js";
import { convertBBCode } from "../src/reverse-converter.js";
import { renderBBCode } from "../src/preview.js";

const SIGNATURE_MAX_LINES = 4;
const PM_MAX_CHARS = 15000;

const editor = document.querySelector("#editor");
const editorTitle = document.querySelector("#editor-title");
const preview = document.querySelector("#preview");
const previewStage = document.querySelector("#preview-stage");
const warningsEl = document.querySelector("#warnings");
const warningCount = document.querySelector("#warning-count");
const charCount = document.querySelector("#char-count");
const draftsSelect = document.querySelector("#drafts");

let mode = "bbcode";
let profile = "forum";
let activeDraftId = null;
let autosaveTimer = null;

function currentBBCode() {
  return mode === "bbcode" ? { output: editor.value, warnings: [] } : convertMarkdown(editor.value);
}

function sourceLineCount(value) {
  return (value ?? "").replace(/\r\n/g, "\n").split("\n").length;
}

function render() {
  const result = currentBBCode();
  const warnings = [...result.warnings];
  const n = editor.value.length;
  const lines = sourceLineCount(editor.value);

  if (profile === "signature" && lines > SIGNATURE_MAX_LINES) {
    warnings.push({
      line: SIGNATURE_MAX_LINES + 1,
      code: "signature-line-limit",
      message: `Signaturkällan har ${lines} rader. Flashback-signaturer ska hållas till högst ${SIGNATURE_MAX_LINES} källrader.`,
    });
  }

  preview.innerHTML = renderBBCode(result.output);
  preview.classList.toggle("signature-preview", profile === "signature");

  warningsEl.replaceChildren();
  warningCount.textContent = String(warnings.length);
  for (const w of warnings) {
    const li = document.createElement("li");
    li.textContent = `Rad ${w.line}: ${w.message}`;
    warningsEl.appendChild(li);
  }

  if (profile === "pm") {
    charCount.textContent = `${n.toLocaleString("sv-SE")} / 15 000 tecken`;
    charCount.classList.toggle("over-limit", n > PM_MAX_CHARS);
  } else if (profile === "signature") {
    charCount.textContent = `${n.toLocaleString("sv-SE")} tecken · ${lines} / ${SIGNATURE_MAX_LINES} källrader`;
    charCount.classList.toggle("over-limit", lines > SIGNATURE_MAX_LINES);
  } else {
    charCount.textContent = `${n.toLocaleString("sv-SE")} tecken`;
    charCount.classList.remove("over-limit");
  }
}

function syncModeUi() {
  document.querySelector("#mode-md").classList.toggle("active", mode === "markdown");
  document.querySelector("#mode-bb").classList.toggle("active", mode === "bbcode");

  if (profile === "signature") {
    editor.placeholder = mode === "bbcode" ? "Skriv signatur i BBCode här..." : "Skriv signatur i Markdown här...";
  } else {
    editor.placeholder = mode === "bbcode" ? "Skriv BBCode här..." : "Skriv Markdown här...";
  }

  for (const el of document.querySelectorAll(".bbcode-only")) {
    const disabled = mode !== "bbcode";
    if (el.matches("button")) el.disabled = disabled;
    if (el.matches("details")) {
      if (disabled) el.open = false;
      el.classList.toggle("mode-disabled", disabled);
    }
  }
}

function syncProfileUi() {
  document.querySelector("#profile-forum").classList.toggle("active", profile === "forum");
  document.querySelector("#profile-pm").classList.toggle("active", profile === "pm");
  document.querySelector("#profile-signature").classList.toggle("active", profile === "signature");

  editor.classList.toggle("signature-mode", profile === "signature");
  editorTitle.textContent = profile === "signature" ? "Redigera signatur" : profile === "pm" ? "Skriv PM" : "Skriv inlägg";
  syncModeUi();
}

function setProfile(next) {
  if (next === profile) return;
  profile = next;
  syncProfileUi();
  render();
  scheduleAutosave();
}

function setMode(next) {
  if (next === mode) return;
  if (next === "bbcode") {
    editor.value = convertMarkdown(editor.value).output;
  } else {
    editor.value = convertBBCode(editor.value).output;
  }
  mode = next;
  syncModeUi();
  render();
  scheduleAutosave();
}

function wrapSelection(open, close = open) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end);
  const before = editor.value.slice(0, start);
  const after = editor.value.slice(end);
  const markdownWrap = { b: "**", i: "*", u: "++" };
  const left = mode === "bbcode" ? `[${open}]` : (markdownWrap[open] ?? "");
  const right = mode === "bbcode" ? `[/${close}]` : (markdownWrap[close] ?? "");
  if (!left && !right) return;
  editor.value = before + left + selected + right + after;
  const caretStart = start + left.length;
  editor.focus();
  editor.setSelectionRange(caretStart, caretStart + selected.length);
  render();
  scheduleAutosave();
}

function blockSelection(tag) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || "text";
  let value;

  if (mode === "bbcode") {
    value = `[${tag}]${selected}[/${tag}]`;
  } else if (["quote", "indent", "spoiler"].includes(tag)) {
    value = selected.split("\n").map(x => `> ${x}`).join("\n");
  } else if (["code", "noparse"].includes(tag)) {
    value = `\`\`\`text\n${selected}\n\`\`\``;
  } else {
    return;
  }

  editor.setRangeText(value, start, end, "select");
  render();
  scheduleAutosave();
}

function listSelection(type) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lines = (editor.value.slice(start, end) || "item").split("\n");
  let value;

  if (mode === "bbcode") {
    const suffix = type === "bullet" ? "" : `=${type}`;
    value = `[list${suffix}]\n${lines.map(x => `[*]${x}`).join("\n")}\n[/list]`;
  } else {
    value = lines.map((x, i) => type === "bullet" ? `- ${x}` : `${i + 1}. ${x}`).join("\n");
  }

  editor.setRangeText(value, start, end, "select");
  render();
  scheduleAutosave();
}

function insertLink() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const label = editor.value.slice(start, end) || "länktext";
  const url = prompt("URL:", "https://");
  if (!url) return;
  const value = mode === "bbcode" ? `[url=${url}]${label}[/url]` : `[${label}](${url})`;
  editor.setRangeText(value, start, end, "select");
  render();
  scheduleAutosave();
}

function insertEmail() {
  if (mode !== "bbcode") return;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end);
  const address = selected || prompt("E-postadress:", "");
  if (!address) return;
  editor.setRangeText(`[email]${address}[/email]`, start, end, "select");
  render();
  scheduleAutosave();
}

function insertSmiley(value) {
  if (mode !== "bbcode") return;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.setRangeText(value, start, end, "end");
  editor.focus();
  render();
  scheduleAutosave();
}

function clearEditor() {
  clearTimeout(autosaveTimer);
  autosaveTimer = null;
  editor.value = "";
  editor.setSelectionRange(0, 0);
  render();
  editor.focus();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("flashbackaren-editor", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("drafts", { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDraft({ quiet = false } = {}) {
  const db = await openDb();
  const tx = db.transaction("drafts", "readwrite");
  const store = tx.objectStore("drafts");
  const draft = {
    ...(activeDraftId ? { id: Number(activeDraftId) } : {}),
    title: (editor.value.trim().split("\n")[0] || "Namnlöst utkast").slice(0, 60),
    content: editor.value,
    mode,
    profile,
    updatedAt: Date.now(),
  };
  const req = store.put(draft);
  await new Promise((resolve, reject) => {
    req.onsuccess = () => { activeDraftId = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
  db.close();
  await refreshDrafts();
  if (!quiet) draftsSelect.value = String(activeDraftId);
}

async function refreshDrafts() {
  const db = await openDb();
  const tx = db.transaction("drafts", "readonly");
  const req = tx.objectStore("drafts").getAll();
  const drafts = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.updatedAt - a.updatedAt));
    req.onerror = () => reject(req.error);
  });
  db.close();
  draftsSelect.replaceChildren(new Option("Utkast…", ""));
  for (const d of drafts) draftsSelect.add(new Option(d.title, String(d.id)));
}

async function loadDraft(id) {
  const db = await openDb();
  const tx = db.transaction("drafts", "readonly");
  const req = tx.objectStore("drafts").get(Number(id));
  const draft = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!draft) return;
  activeDraftId = draft.id;
  editor.value = draft.content;
  mode = draft.mode || "bbcode";
  profile = draft.profile || "forum";
  syncProfileUi();
  render();
}

function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (editor.value.trim()) saveDraft({ quiet: true }).catch(console.error);
  }, 1200);
}

editor.addEventListener("input", () => { render(); scheduleAutosave(); });

document.querySelectorAll("[data-wrap]").forEach(btn => btn.addEventListener("click", () => wrapSelection(btn.dataset.wrap)));
document.querySelectorAll("[data-block]").forEach(btn => btn.addEventListener("click", () => blockSelection(btn.dataset.block)));
document.querySelectorAll("[data-smiley]").forEach(btn => btn.addEventListener("click", () => insertSmiley(btn.dataset.smiley)));
document.querySelector("#link-btn").addEventListener("click", insertLink);
document.querySelector("#email-btn").addEventListener("click", insertEmail);
document.querySelector("#ul-btn").addEventListener("click", () => listSelection("bullet"));
document.querySelector("#ol-btn").addEventListener("click", () => listSelection("1"));
document.querySelector("#alpha-list-btn").addEventListener("click", () => listSelection("a"));
document.querySelector("#roman-list-btn").addEventListener("click", () => listSelection("i"));
document.querySelector("#mode-md").addEventListener("click", () => setMode("markdown"));
document.querySelector("#mode-bb").addEventListener("click", () => setMode("bbcode"));

document.querySelector("#profile-forum").addEventListener("click", () => setProfile("forum"));
document.querySelector("#profile-pm").addEventListener("click", () => setProfile("pm"));
document.querySelector("#profile-signature").addEventListener("click", () => setProfile("signature"));

document.querySelector("#preview-desktop").addEventListener("click", () => {
  previewStage.className = "preview-stage desktop";
  document.querySelector("#preview-desktop").classList.add("active");
  document.querySelector("#preview-mobile").classList.remove("active");
});
document.querySelector("#preview-mobile").addEventListener("click", () => {
  previewStage.className = "preview-stage mobile";
  document.querySelector("#preview-mobile").classList.add("active");
  document.querySelector("#preview-desktop").classList.remove("active");
});

document.querySelector("#save-draft").addEventListener("click", () => saveDraft());
document.querySelector("#new-draft").addEventListener("click", () => {
  activeDraftId = null;
  editor.value = "";
  mode = "bbcode";
  syncProfileUi();
  render();
  editor.focus();
});
draftsSelect.addEventListener("change", () => draftsSelect.value && loadDraft(draftsSelect.value));
document.querySelector("#copy").addEventListener("click", async () => navigator.clipboard.writeText(editor.value));
document.querySelector("#clear").addEventListener("click", event => {
  event.preventDefault();
  clearEditor();
});

document.addEventListener("keydown", event => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (["b", "i", "u"].includes(key)) {
    event.preventDefault();
    wrapSelection(key);
  }
});

editor.value = "[b]Exempel[/b]\n\n[b]Fet[/b], [i]kursiv[/i], [u]understruken[/u] och [highlight]markerad[/highlight] text.\n\n[list]\n[*]punkt ett\n[*]punkt två\n[/list]";
syncProfileUi();
render();
refreshDrafts().catch(console.error);
