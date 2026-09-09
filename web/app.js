import { convertMarkdown } from "../src/converter.js";
import { convertBBCode } from "../src/reverse-converter.js";
import { renderBBCode } from "../src/preview.js";

const editor = document.querySelector("#editor");
const preview = document.querySelector("#preview");
const previewStage = document.querySelector("#preview-stage");
const warningsEl = document.querySelector("#warnings");
const warningCount = document.querySelector("#warning-count");
const charCount = document.querySelector("#char-count");
const draftsSelect = document.querySelector("#drafts");

let mode = "markdown";
let profile = "forum";
let activeDraftId = null;
let autosaveTimer = null;

function currentBBCode() {
  return mode === "bbcode" ? { output: editor.value, warnings: [] } : convertMarkdown(editor.value);
}

function render() {
  const result = currentBBCode();
  preview.innerHTML = renderBBCode(result.output);
  warningsEl.replaceChildren();
  warningCount.textContent = String(result.warnings.length);
  for (const w of result.warnings) {
    const li = document.createElement("li");
    li.textContent = `Rad ${w.line}: ${w.message}`;
    warningsEl.appendChild(li);
  }

  const n = editor.value.length;
  if (profile === "pm") {
    charCount.textContent = `${n.toLocaleString("sv-SE")} / 15 000 tecken`;
    charCount.classList.toggle("over-limit", n > 15000);
  } else {
    charCount.textContent = `${n.toLocaleString("sv-SE")} tecken`;
    charCount.classList.remove("over-limit");
  }
}

function setMode(next) {
  if (next === mode) return;
  if (next === "bbcode") {
    editor.value = convertMarkdown(editor.value).output;
  } else {
    const result = convertBBCode(editor.value);
    editor.value = result.output;
  }
  mode = next;
  document.querySelector("#mode-md").classList.toggle("active", mode === "markdown");
  document.querySelector("#mode-bb").classList.toggle("active", mode === "bbcode");
  render();
}

function wrapSelection(open, close = open) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end);
  const before = editor.value.slice(0, start);
  const after = editor.value.slice(end);
  const left = mode === "bbcode" ? `[${open}]` : ({ b: "**", i: "*", u: "++", highlight: "==" }[open] ?? "");
  const right = mode === "bbcode" ? `[/${close}]` : ({ b: "**", i: "*", u: "++", highlight: "==" }[close] ?? "");
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
  if (mode === "bbcode") value = `[${tag}]${selected}[/${tag}]`;
  else if (tag === "quote") value = selected.split("\n").map(x => `> ${x}`).join("\n");
  else if (tag === "spoiler") value = `:::spoiler\n${selected}\n:::`;
  else value = `\`\`\`text\n${selected}\n\`\`\``;
  editor.setRangeText(value, start, end, "select");
  render();
  scheduleAutosave();
}

function listSelection(ordered) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lines = (editor.value.slice(start, end) || "item").split("\n");
  let value;
  if (mode === "bbcode") {
    value = `[list${ordered ? "=1" : ""}]\n${lines.map(x => `[*]${x}`).join("\n")}\n[/list]`;
  } else {
    value = lines.map((x, i) => ordered ? `${i + 1}. ${x}` : `- ${x}`).join("\n");
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
  mode = draft.mode || "markdown";
  profile = draft.profile || "forum";
  document.querySelector("#mode-md").classList.toggle("active", mode === "markdown");
  document.querySelector("#mode-bb").classList.toggle("active", mode === "bbcode");
  document.querySelector("#profile-forum").classList.toggle("active", profile === "forum");
  document.querySelector("#profile-pm").classList.toggle("active", profile === "pm");
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
document.querySelector("#link-btn").addEventListener("click", insertLink);
document.querySelector("#ul-btn").addEventListener("click", () => listSelection(false));
document.querySelector("#ol-btn").addEventListener("click", () => listSelection(true));
document.querySelector("#mode-md").addEventListener("click", () => setMode("markdown"));
document.querySelector("#mode-bb").addEventListener("click", () => setMode("bbcode"));

document.querySelector("#profile-forum").addEventListener("click", () => {
  profile = "forum";
  document.querySelector("#profile-forum").classList.add("active");
  document.querySelector("#profile-pm").classList.remove("active");
  render();
});
document.querySelector("#profile-pm").addEventListener("click", () => {
  profile = "pm";
  document.querySelector("#profile-pm").classList.add("active");
  document.querySelector("#profile-forum").classList.remove("active");
  render();
});

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
  render();
  editor.focus();
});
draftsSelect.addEventListener("change", () => draftsSelect.value && loadDraft(draftsSelect.value));
document.querySelector("#copy").addEventListener("click", async () => navigator.clipboard.writeText(editor.value));

document.addEventListener("keydown", event => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (["b", "i", "u"].includes(key)) {
    event.preventDefault();
    wrapSelection(key);
  }
});

editor.value = "# Exempel\n\n**Fet**, *kursiv*, ++understruken++ och ==markerad== text.\n\n- punkt ett\n- punkt två";
render();
refreshDrafts().catch(console.error);
