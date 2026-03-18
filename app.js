// ── State ────────────────────────────────────────────────────────────────
const state = {
  turnIdx: 0,
  score: 0,
  chosen: null,   // null | "correct" | "wrong"
  typed: "",
  kbVisible: true,
};

// ── DOM refs ─────────────────────────────────────────────────────────────
const chatArea     = document.getElementById("chat-area");
const chatEnd      = document.getElementById("chat-end");
const scoreVal     = document.getElementById("score-val");
const progressDots = document.getElementById("progress-dots");
const doneScreen   = document.getElementById("done-screen");
const doneScoreEl  = document.getElementById("done-score");
const restartBtn   = document.getElementById("restart-btn");
const kbToggleBtn  = document.getElementById("kb-toggle");
const kbBody       = document.getElementById("kb-body");

// ── Helpers ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrollToEnd() {
  setTimeout(() => chatEnd.scrollIntoView({ behavior: "smooth" }), 60);
}

// ── Progress dots ─────────────────────────────────────────────────────────
function renderProgress() {
  progressDots.innerHTML = "";
  SCRIPT.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    dot.style.background =
      i < state.turnIdx   ? "#4CAF82" :
      i === state.turnIdx ? "#ffffff" :
      "rgba(255,255,255,0.2)";
    progressDots.appendChild(dot);
  });
  scoreVal.textContent = state.score;
}

// ── History bubble (frozen past messages) ────────────────────────────────
function appendHistoryBubble(who, ua, en) {
  const row = document.createElement("div");
  row.className = who === "bot" ? "bot-row" : "user-row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "bot" ? "🤖" : "👤";

  const bubble = document.createElement("div");
  bubble.className = who === "bot" ? "bot-bubble revealed" : "user-bubble";

  const uaEl = document.createElement("div");
  uaEl.className = "bubble-ua";
  uaEl.textContent = ua;

  const enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = en;

  bubble.appendChild(uaEl);
  bubble.appendChild(enEl);

  if (who === "bot") { row.appendChild(avatar); row.appendChild(bubble); }
  else               { row.appendChild(bubble); row.appendChild(avatar); }

  chatArea.insertBefore(row, chatEnd);
  scrollToEnd();
}

// ── Live bot bubble (no translation yet) ─────────────────────────────────
let currentBotRow = null;

function renderBotBubble(turn) {
  if (currentBotRow) currentBotRow.remove();

  const row = document.createElement("div");
  row.className = "bot-row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bot-bubble";
  bubble.id = "current-bot-bubble";

  const uaEl = document.createElement("div");
  uaEl.className = "bubble-ua";
  uaEl.textContent = turn.bot;
  bubble.appendChild(uaEl);

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatArea.insertBefore(row, chatEnd);
  currentBotRow = row;
  scrollToEnd();
}

function revealBotBubble(correctText) {
  const bubble = document.getElementById("current-bot-bubble");
  if (!bubble) return;
  bubble.classList.add("revealed");
  const enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = correctText;
  bubble.appendChild(enEl);
}

// ── Choose phase ──────────────────────────────────────────────────────────
let chooseAreaEl = null;

function renderChoosePhase(turn) {
  if (chooseAreaEl) chooseAreaEl.remove();
  state.chosen = null;

  const shuffled = shuffle([
    { text: turn.correct, right: true },
    { text: turn.decoys[0], right: false },
    { text: turn.decoys[1], right: false },
  ]);

  const area = document.createElement("div");
  area.className = "choose-area";

  const label = document.createElement("div");
  label.className = "choose-label";
  label.textContent = "What does this mean?";
  area.appendChild(label);

  const grid = document.createElement("div");
  grid.className = "options-grid";

  shuffled.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";

    const letter = document.createElement("span");
    letter.className = "opt-letter";
    letter.textContent = ["A", "B", "C"][i];
    btn.appendChild(letter);
    btn.appendChild(document.createTextNode(opt.text));

    btn.addEventListener("click", () => onChoice(opt, btn, area, grid, turn));
    grid.appendChild(btn);
  });

  area.appendChild(grid);
  chatArea.insertBefore(area, chatEnd);
  chooseAreaEl = area;
  scrollToEnd();
}

function onChoice(opt, btn, area, grid, turn) {
  if (state.chosen === "correct") return;

  if (opt.right) {
    state.chosen = "correct";
    state.score++;
    renderProgress();
    btn.classList.add("correct");
    grid.querySelectorAll(".opt-btn").forEach(b => (b.disabled = true));
    revealBotBubble(turn.correct);
    setTimeout(() => {
      area.remove();
      chooseAreaEl = null;
      renderTypePhase(turn);
    }, 650);
  } else {
    btn.classList.add("wrong");
    area.classList.add("shake");

    // Remove existing wrong-hint so we don't duplicate
    const existing = area.querySelector(".wrong-hint");
    if (!existing) {
      const hint = document.createElement("div");
      hint.className = "wrong-hint";
      hint.textContent = "Not quite — try again! 🙂";
      area.appendChild(hint);
    }

    setTimeout(() => {
      area.classList.remove("shake");
      btn.classList.remove("wrong");
      btn.disabled = false;
    }, 550);
  }
}

// ── Type phase ────────────────────────────────────────────────────────────
let typeAreaEl = null;

function renderTypePhase(turn) {
  if (typeAreaEl) typeAreaEl.remove();
  state.typed = "";

  const area = document.createElement("div");
  area.className = "type-area";

  const userRow = document.createElement("div");
  userRow.className = "user-row";

  const prompt = document.createElement("div");
  prompt.className = "type-prompt";

  // Label
  const lbl = document.createElement("div");
  lbl.className = "type-label";
  lbl.textContent = "Your turn — type your reply:";
  prompt.appendChild(lbl);

  // English hint
  const hint = document.createElement("div");
  hint.className = "reply-hint";
  hint.textContent = turn.replyEn;
  prompt.appendChild(hint);

  // Target character display
  const targetEl = document.createElement("div");
  targetEl.className = "target-word";
  targetEl.id = "target-word";
  prompt.appendChild(targetEl);

  // Input
  const input = document.createElement("input");
  input.type = "text";
  input.className = "type-input";
  input.id = "type-input";
  input.placeholder = "type in Ukrainian…";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");
  prompt.appendChild(input);

  // Key hint chips
  const keyRow = document.createElement("div");
  keyRow.className = "key-hint-row";
  keyRow.id = "key-hint-row";
  prompt.appendChild(keyRow);

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "👤";

  userRow.appendChild(prompt);
  userRow.appendChild(avatar);
  area.appendChild(userRow);
  chatArea.insertBefore(area, chatEnd);
  typeAreaEl = area;

  // Wire up typing
  input.addEventListener("input", () => onTyping(turn, input));

  // Initial render
  renderTargetWord(turn.reply, "");
  updateKeyboardForPos(turn.reply, "");

  setTimeout(() => { input.focus(); scrollToEnd(); }, 60);
}

// Render the coloured target word character by character
function renderTargetWord(target, typed) {
  const el = document.getElementById("target-word");
  if (!el) return;
  el.innerHTML = "";

  Array.from(target).forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";

    // Use non-breaking space so spaces are visible
    span.textContent = ch === " " ? "\u00A0" : ch;

    if (i < typed.length) {
      span.classList.add(typed[i] === ch ? "correct-char" : "wrong-char");
    } else if (i === typed.length) {
      span.classList.add("cursor");
    } else {
      span.classList.add("pending");
    }
    el.appendChild(span);
  });
}

// Render the "next keys" hint chips below the input
function renderKeyHints(target, typed) {
  const row = document.getElementById("key-hint-row");
  if (!row) return;
  row.innerHTML = "";

  // Show next 5 characters
  const upcoming = Array.from(target.slice(typed.length, typed.length + 5));
  if (upcoming.length === 0) return;

  const lbl = document.createElement("span");
  lbl.className = "key-hint-label";
  lbl.textContent = "Next:";
  row.appendChild(lbl);

  upcoming.forEach((ch, i) => {
    const label = getKeyLabel(ch);
    if (!label) return;

    const chip = document.createElement("span");
    chip.className = "key-chip " + (i === 0 ? "next" : "upcoming");
    chip.textContent = label;
    row.appendChild(chip);
  });
}

// Update keyboard highlights and key info panel for current position
function updateKeyboardForPos(target, typed) {
  const nextChar = typed.length < target.length ? target[typed.length] : null;
  const activeEN = nextChar ? getEnKey(nextChar) : null;

  // Upcoming Cyrillic keys (skip punctuation/space — they have no EN key)
  const upcomingEN = Array.from(target.slice(typed.length + 1, typed.length + 5))
    .map(c => getEnKey(c))
    .filter(Boolean);

  updateKeyboard(activeEN, upcomingEN);
  renderKeyHints(target, typed);
}

// Handle each keystroke in the input
function onTyping(turn, input) {
  const val = input.value;
  state.typed = val;

  renderTargetWord(turn.reply, val);
  updateKeyboardForPos(turn.reply, val);

  // Complete!
  if (val === turn.reply) {
    setTimeout(() => {
      // Freeze user reply as a history bubble
      appendHistoryBubble("user", turn.reply, turn.replyEn);

      // Remove live elements
      if (typeAreaEl)    { typeAreaEl.remove();    typeAreaEl = null; }
      if (currentBotRow) { currentBotRow.remove(); currentBotRow = null; }

      updateKeyboard(null, []);

      const nextIdx = state.turnIdx + 1;
      if (nextIdx < SCRIPT.length) {
        state.turnIdx = nextIdx;
        renderProgress();
        startTurn();
      } else {
        showDoneScreen();
      }
    }, 380);
  }
}

// ── Turn flow ─────────────────────────────────────────────────────────────
function startTurn() {
  const turn = SCRIPT[state.turnIdx];
  renderBotBubble(turn);
  setTimeout(() => renderChoosePhase(turn), 280);
}

// ── Done screen ───────────────────────────────────────────────────────────
function showDoneScreen() {
  doneScoreEl.textContent = `${state.score} / ${SCRIPT.length} correct first tries`;
  doneScreen.style.display = "flex";
}

// ── Restart ───────────────────────────────────────────────────────────────
function restartApp() {
  state.turnIdx = 0;
  state.score   = 0;
  state.chosen  = null;
  state.typed   = "";

  // Wipe chat (leave sentinel)
  while (chatArea.firstChild && chatArea.firstChild.id !== "chat-end") {
    chatArea.removeChild(chatArea.firstChild);
  }

  currentBotRow = null;
  chooseAreaEl  = null;
  typeAreaEl    = null;

  doneScreen.style.display = "none";
  updateKeyboard(null, []);
  renderProgress();
  startTurn();
}

// ── Sidebar toggle ────────────────────────────────────────────────────────
kbToggleBtn.addEventListener("click", () => {
  state.kbVisible = !state.kbVisible;
  kbBody.style.display    = state.kbVisible ? "" : "none";
  kbToggleBtn.textContent = state.kbVisible ? "hide" : "show";
});

restartBtn.addEventListener("click", restartApp);

// ── Boot ──────────────────────────────────────────────────────────────────
buildKeyboard();
renderProgress();
startTurn();
