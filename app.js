// ── State ────────────────────────────────────────────────────────────────
const state = {
  turnIdx: 0,
  phase: "choose",   // "choose" | "type" | "done"
  score: 0,
  options: [],       // shuffled [{text, right}]
  chosen: null,      // null | "correct" | "wrong"
  typed: "",
  history: [],       // [{who:"bot"|"user", ua, en}]
  kbVisible: true,
};

// ── DOM refs ─────────────────────────────────────────────────────────────
const chatArea    = document.getElementById("chat-area");
const chatEnd     = document.getElementById("chat-end");
const scoreVal    = document.getElementById("score-val");
const progressDots = document.getElementById("progress-dots");
const doneScreen  = document.getElementById("done-screen");
const doneScoreEl = document.getElementById("done-score");
const restartBtn  = document.getElementById("restart-btn");
const kbToggleBtn = document.getElementById("kb-toggle");
const kbBody      = document.getElementById("kb-body");

// ── Helpers ──────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrollToEnd() {
  setTimeout(() => chatEnd.scrollIntoView({ behavior: "smooth" }), 50);
}

// ── Progress dots ────────────────────────────────────────────────────────
function renderProgress() {
  progressDots.innerHTML = "";
  SCRIPT.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    dot.style.background =
      i < state.turnIdx  ? "#4CAF82" :
      i === state.turnIdx ? "#fff"   :
      "rgba(255,255,255,0.2)";
    progressDots.appendChild(dot);
  });
  scoreVal.textContent = state.score;
}

// ── Chat history bubble ───────────────────────────────────────────────────
function appendHistoryBubble(who, ua, en) {
  const row = document.createElement("div");
  row.className = who === "bot" ? "bot-row" : "user-row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "bot" ? "🤖" : "👤";

  const bubble = document.createElement("div");
  bubble.className = who === "bot" ? "bot-bubble" : "user-bubble";
  if (who === "bot") bubble.classList.add("revealed");

  const uaEl = document.createElement("div");
  uaEl.className = "bubble-ua";
  uaEl.textContent = ua;

  const enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = en;

  bubble.appendChild(uaEl);
  bubble.appendChild(enEl);

  if (who === "bot") {
    row.appendChild(avatar);
    row.appendChild(bubble);
  } else {
    row.appendChild(bubble);
    row.appendChild(avatar);
  }

  chatArea.insertBefore(row, chatEnd);
  scrollToEnd();
}

// ── Current bot bubble (before answer revealed) ──────────────────────────
let currentBotBubbleEl = null;

function renderBotBubble(turn) {
  // Remove previous current bubble if any
  if (currentBotBubbleEl) currentBotBubbleEl.remove();

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
  currentBotBubbleEl = row;
  scrollToEnd();
}

function revealBotBubble(turn) {
  const bubble = document.getElementById("current-bot-bubble");
  if (!bubble) return;
  bubble.classList.add("revealed");
  const enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = turn.correct;
  bubble.appendChild(enEl);
}

// ── Choose phase ─────────────────────────────────────────────────────────
let chooseAreaEl = null;

function renderChoosePhase(turn) {
  if (chooseAreaEl) chooseAreaEl.remove();

  const opts = shuffle([
    { text: turn.correct, right: true },
    { text: turn.decoys[0], right: false },
    { text: turn.decoys[1], right: false },
  ]);
  state.options = opts;
  state.chosen = null;

  const area = document.createElement("div");
  area.className = "choose-area";
  area.id = "choose-area";

  const label = document.createElement("div");
  label.className = "choose-label";
  label.textContent = "What does this mean?";
  area.appendChild(label);

  const grid = document.createElement("div");
  grid.className = "options-grid";

  opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.dataset.idx = i;

    const letter = document.createElement("span");
    letter.className = "opt-letter";
    letter.textContent = ["A", "B", "C"][i];
    btn.appendChild(letter);

    const text = document.createTextNode(opt.text);
    btn.appendChild(text);

    btn.addEventListener("click", () => handleChoice(opt, btn, area, grid, turn));
    grid.appendChild(btn);
  });

  area.appendChild(grid);
  chatArea.insertBefore(area, chatEnd);
  chooseAreaEl = area;
  scrollToEnd();
}

function handleChoice(opt, btn, area, grid, turn) {
  if (state.chosen === "correct") return;

  if (opt.right) {
    state.chosen = "correct";
    state.score++;
    renderProgress();
    btn.classList.add("correct");

    // Disable all buttons
    grid.querySelectorAll(".opt-btn").forEach(b => b.disabled = true);

    // Reveal bot bubble meaning
    revealBotBubble(turn);

    // Move to type phase after short delay
    setTimeout(() => {
      area.remove();
      chooseAreaEl = null;
      renderTypePhase(turn);
    }, 700);

  } else {
    state.chosen = "wrong";
    btn.classList.add("wrong");

    // Show wrong hint if not already shown
    if (!area.querySelector(".wrong-hint")) {
      const hint = document.createElement("div");
      hint.className = "wrong-hint";
      hint.textContent = "That's not quite right — try again! 🙂";
      area.appendChild(hint);
    }

    // Shake
    area.classList.add("shake");
    setTimeout(() => area.classList.remove("shake"), 500);

    // Re-enable wrong button after shake
    setTimeout(() => {
      btn.classList.remove("wrong");
      btn.disabled = false;
    }, 600);
  }
}

// ── Type phase ───────────────────────────────────────────────────────────
let typeAreaEl = null;
let typeInput = null;

function renderTypePhase(turn) {
  if (typeAreaEl) typeAreaEl.remove();

  state.typed = "";

  const area = document.createElement("div");
  area.className = "type-area";
  area.id = "type-area";

  const userRow = document.createElement("div");
  userRow.className = "user-row";

  const prompt = document.createElement("div");
  prompt.className = "type-prompt";

  // Label
  const lbl = document.createElement("div");
  lbl.className = "type-label";
  lbl.textContent = "Your turn — type your reply:";
  prompt.appendChild(lbl);

  // Hint (English meaning)
  const hint = document.createElement("div");
  hint.className = "reply-hint";
  hint.textContent = turn.replyEn;
  prompt.appendChild(hint);

  // Target word display
  const targetEl = document.createElement("div");
  targetEl.className = "target-word";
  targetEl.id = "target-word";
  prompt.appendChild(targetEl);
  renderTargetWord(turn.reply, "");

  // Text input
  const input = document.createElement("input");
  input.type = "text";
  input.className = "type-input";
  input.placeholder = "type in Ukrainian…";
  input.autocomplete = "off";
  input.autocorrect = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.id = "type-input";
  typeInput = input;

  input.addEventListener("input", () => handleTyping(turn));
  prompt.appendChild(input);

  // Key hint row
  const keyRow = document.createElement("div");
  keyRow.className = "key-hint-row";
  keyRow.id = "key-hint-row";
  prompt.appendChild(keyRow);

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "👤";

  userRow.appendChild(prompt);
  userRow.appendChild(avatar);
  area.appendChild(userRow);
  chatArea.insertBefore(area, chatEnd);
  typeAreaEl = area;

  // Initial keyboard state
  updateKeyboardForPosition(turn.reply, "");

  setTimeout(() => {
    input.focus();
    scrollToEnd();
  }, 50);
}

function renderTargetWord(target, typed) {
  const el = document.getElementById("target-word");
  if (!el) return;
  el.innerHTML = "";

  Array.from(target).forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;

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

function renderKeyHints(target, typed) {
  const row = document.getElementById("key-hint-row");
  if (!row) return;
  row.innerHTML = "";

  const nextKeys = Array.from(target.slice(typed.length, typed.length + 5))
    .map(c => (c === " " ? "space" : getEnKey(c) || c));

  if (nextKeys.length === 0) return;

  const lbl = document.createElement("span");
  lbl.className = "key-hint-label";
  lbl.textContent = "Next keys:";
  row.appendChild(lbl);

  nextKeys.forEach((k, i) => {
    const chip = document.createElement("span");
    chip.className = "key-chip " + (i === 0 ? "next" : "upcoming");
    chip.textContent = k === "space" ? "Space" : k.toUpperCase();
    row.appendChild(chip);
  });
}

function updateKeyboardForPosition(target, typed) {
  const activeChar = typed.length < target.length ? target[typed.length] : null;
  const activeEN = activeChar ? getEnKey(activeChar) : null;

  const upcoming = Array.from(target.slice(typed.length + 1, typed.length + 4))
    .map(c => getEnKey(c))
    .filter(Boolean);

  updateKeyboard(activeEN, upcoming);
  renderKeyHints(target, typed);
}

function handleTyping(turn) {
  const input = document.getElementById("type-input");
  if (!input) return;

  const val = input.value;
  state.typed = val;

  renderTargetWord(turn.reply, val);
  updateKeyboardForPosition(turn.reply, val);

  // Correct! Move to next turn
  if (val === turn.reply) {
    // Add both bubbles to history
    const histBotUA = turn.bot;
    const histBotEN = turn.correct;

    // Push user reply to history area properly after a beat
    setTimeout(() => {
      // Commit current bot bubble to history-style (already in DOM, just leave it)
      // Add user bubble to history
      appendHistoryBubble("user", turn.reply, turn.replyEn);

      // Clean up active elements
      if (typeAreaEl) { typeAreaEl.remove(); typeAreaEl = null; }
      if (currentBotBubbleEl) { currentBotBubbleEl.remove(); currentBotBubbleEl = null; }

      updateKeyboard(null, []);

      const nextIdx = state.turnIdx + 1;
      if (nextIdx < SCRIPT.length) {
        state.turnIdx = nextIdx;
        renderProgress();
        startTurn();
      } else {
        showDoneScreen();
      }
    }, 400);
  }
}

// ── Turn orchestration ───────────────────────────────────────────────────
function startTurn() {
  const turn = SCRIPT[state.turnIdx];
  renderBotBubble(turn);

  // Small delay so bot bubble animates in before options appear
  setTimeout(() => renderChoosePhase(turn), 300);
}

// ── Done screen ──────────────────────────────────────────────────────────
function showDoneScreen() {
  doneScoreEl.textContent = `${state.score} / ${SCRIPT.length} correct first tries`;
  doneScreen.style.display = "flex";
}

// ── Restart ──────────────────────────────────────────────────────────────
function restartApp() {
  // Reset state
  state.turnIdx = 0;
  state.phase = "choose";
  state.score = 0;
  state.options = [];
  state.chosen = null;
  state.typed = "";
  state.history = [];

  // Clear chat area (keep the #chat-end sentinel)
  while (chatArea.firstChild && chatArea.firstChild !== chatEnd) {
    chatArea.removeChild(chatArea.firstChild);
  }
  chatArea.appendChild(chatEnd);

  currentBotBubbleEl = null;
  chooseAreaEl = null;
  typeAreaEl = null;
  typeInput = null;

  doneScreen.style.display = "none";
  updateKeyboard(null, []);
  renderProgress();
  startTurn();
}

// ── Keyboard toggle ──────────────────────────────────────────────────────
kbToggleBtn.addEventListener("click", () => {
  state.kbVisible = !state.kbVisible;
  kbBody.style.display = state.kbVisible ? "" : "none";
  kbToggleBtn.textContent = state.kbVisible ? "hide" : "show";
});

restartBtn.addEventListener("click", restartApp);

// ── Boot ─────────────────────────────────────────────────────────────────
buildKeyboard();
renderProgress();
startTurn();
