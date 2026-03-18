// ── State ─────────────────────────────────────────────────────────────────
var state = {
  turnIdx:   0,
  score:     0,
  chosen:    null,   // null | "correct" | "wrong"
  typed:     "",
  kbVisible: true
};

// ── DOM refs ──────────────────────────────────────────────────────────────
var chatArea     = document.getElementById("chat-area");
var chatEnd      = document.getElementById("chat-end");
var scoreVal     = document.getElementById("score-val");
var progressDots = document.getElementById("progress-dots");
var doneScreen   = document.getElementById("done-screen");
var doneScoreEl  = document.getElementById("done-score");
var restartBtn   = document.getElementById("restart-btn");
var kbToggleBtn  = document.getElementById("kb-toggle");
var kbBody       = document.getElementById("kb-body");

// ── Helpers ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function scrollToEnd() {
  setTimeout(function() {
    chatEnd.scrollIntoView({ behavior: "smooth" });
  }, 60);
}

// ── Progress dots ─────────────────────────────────────────────────────────
function renderProgress() {
  progressDots.innerHTML = "";
  SCRIPT.forEach(function(_, i) {
    var dot = document.createElement("div");
    dot.className = "progress-dot";
    dot.style.background =
      i < state.turnIdx   ? "#4CAF82" :
      i === state.turnIdx ? "#ffffff" :
      "rgba(255,255,255,0.2)";
    progressDots.appendChild(dot);
  });
  scoreVal.textContent = state.score;
}

// ── History bubbles (frozen past messages) ────────────────────────────────
function appendHistoryBubble(who, ua, en) {
  var row = document.createElement("div");
  row.className = who === "bot" ? "bot-row" : "user-row";

  var avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "bot" ? "🤖" : "👤";

  var bubble = document.createElement("div");
  bubble.className = who === "bot" ? "bot-bubble revealed" : "user-bubble";

  var uaEl = document.createElement("div");
  uaEl.className = "bubble-ua";
  uaEl.textContent = ua;

  var enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = en;

  bubble.appendChild(uaEl);
  bubble.appendChild(enEl);

  if (who === "bot") { row.appendChild(avatar); row.appendChild(bubble); }
  else               { row.appendChild(bubble); row.appendChild(avatar); }

  chatArea.insertBefore(row, chatEnd);
  scrollToEnd();
}

// ── Live bot bubble ───────────────────────────────────────────────────────
var currentBotRow = null;

function renderBotBubble(turn) {
  if (currentBotRow) currentBotRow.remove();

  var row = document.createElement("div");
  row.className = "bot-row";

  var avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "🤖";

  var bubble = document.createElement("div");
  bubble.className = "bot-bubble";
  bubble.id = "current-bot-bubble";

  var uaEl = document.createElement("div");
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
  var bubble = document.getElementById("current-bot-bubble");
  if (!bubble) return;
  bubble.classList.add("revealed");
  var enEl = document.createElement("div");
  enEl.className = "bubble-en";
  enEl.textContent = correctText;
  bubble.appendChild(enEl);
}

// ── Choose phase ──────────────────────────────────────────────────────────
var chooseAreaEl = null;

function renderChoosePhase(turn) {
  if (chooseAreaEl) chooseAreaEl.remove();
  state.chosen = null;

  var shuffled = shuffle([
    { text: turn.correct, right: true },
    { text: turn.decoys[0], right: false },
    { text: turn.decoys[1], right: false }
  ]);

  var area = document.createElement("div");
  area.className = "choose-area";

  var label = document.createElement("div");
  label.className = "choose-label";
  label.textContent = "What does this mean?";
  area.appendChild(label);

  var grid = document.createElement("div");
  grid.className = "options-grid";

  shuffled.forEach(function(opt, i) {
    var btn = document.createElement("button");
    btn.className = "opt-btn";

    var letter = document.createElement("span");
    letter.className = "opt-letter";
    letter.textContent = ["A","B","C"][i];
    btn.appendChild(letter);
    btn.appendChild(document.createTextNode(opt.text));

    btn.addEventListener("click", function() {
      onChoice(opt, btn, area, grid, turn);
    });
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
    grid.querySelectorAll(".opt-btn").forEach(function(b) { b.disabled = true; });
    revealBotBubble(turn.correct);
    setTimeout(function() {
      area.remove();
      chooseAreaEl = null;
      renderTypePhase(turn);
    }, 650);
  } else {
    btn.classList.add("wrong");
    area.classList.add("shake");
    if (!area.querySelector(".wrong-hint")) {
      var hint = document.createElement("div");
      hint.className = "wrong-hint";
      hint.textContent = "Not quite - try again!";
      area.appendChild(hint);
    }
    setTimeout(function() {
      area.classList.remove("shake");
      btn.classList.remove("wrong");
      btn.disabled = false;
    }, 550);
  }
}

// ── Type phase ────────────────────────────────────────────────────────────
var typeAreaEl = null;

function renderTypePhase(turn) {
  if (typeAreaEl) typeAreaEl.remove();
  state.typed = "";

  var area = document.createElement("div");
  area.className = "type-area";

  var userRow = document.createElement("div");
  userRow.className = "user-row";

  var prompt = document.createElement("div");
  prompt.className = "type-prompt";

  var lbl = document.createElement("div");
  lbl.className = "type-label";
  lbl.textContent = "Your turn - type your reply:";
  prompt.appendChild(lbl);

  var hint = document.createElement("div");
  hint.className = "reply-hint";
  hint.textContent = turn.replyEn;
  prompt.appendChild(hint);

  var targetEl = document.createElement("div");
  targetEl.className = "target-word";
  targetEl.id = "target-word";
  prompt.appendChild(targetEl);

  var input = document.createElement("input");
  input.type = "text";
  input.className = "type-input";
  input.id = "type-input";
  input.placeholder = "type in Ukrainian…";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");
  prompt.appendChild(input);

  var keyRow = document.createElement("div");
  keyRow.className = "key-hint-row";
  keyRow.id = "key-hint-row";
  prompt.appendChild(keyRow);

  var avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "👤";

  userRow.appendChild(prompt);
  userRow.appendChild(avatar);
  area.appendChild(userRow);
  chatArea.insertBefore(area, chatEnd);
  typeAreaEl = area;

  input.addEventListener("input", function() {
    onTyping(turn, input);
  });

  renderTargetWord(turn.reply, "");
  updateKeyboardForPos(turn.reply, "");

  setTimeout(function() {
    input.focus();
    scrollToEnd();
  }, 60);
}

// Render coloured target word char by char
function renderTargetWord(target, typed) {
  var el = document.getElementById("target-word");
  if (!el) return;
  el.innerHTML = "";

  target.split("").forEach(function(ch, i) {
    var span = document.createElement("span");
    span.className = "char";
    // Use non-breaking space so spaces show as a visible gap
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

// Render next-key hint chips
function renderKeyHints(target, typed) {
  var row = document.getElementById("key-hint-row");
  if (!row) return;
  row.innerHTML = "";

  var upcoming = target.slice(typed.length, typed.length + 5).split("");
  if (upcoming.length === 0) return;

  var lbl = document.createElement("span");
  lbl.className = "key-hint-label";
  lbl.textContent = "Next:";
  row.appendChild(lbl);

  upcoming.forEach(function(ch, i) {
    var label = getKeyLabel(ch);
    if (!label) return;
    var chip = document.createElement("span");
    chip.className = "key-chip " + (i === 0 ? "next" : "upcoming");
    chip.textContent = label;
    row.appendChild(chip);
  });
}

// Update keyboard highlights for current typing position
function updateKeyboardForPos(target, typed) {
  var nextChar = typed.length < target.length ? target[typed.length] : null;
  var activeEN = nextChar ? getEnKey(nextChar) : null;

  // Get upcoming Cyrillic keys (skip spaces)
  var upcomingEN = target.slice(typed.length + 1, typed.length + 5)
    .split("")
    .map(function(c) { return getEnKey(c); })
    .filter(function(k) { return !!k; });

  updateKeyboard(activeEN, upcomingEN);
  renderKeyHints(target, typed);
}

// Handle each keystroke
function onTyping(turn, input) {
  var val = input.value;
  state.typed = val;

  renderTargetWord(turn.reply, val);
  updateKeyboardForPos(turn.reply, val);

  if (val === turn.reply) {
    setTimeout(function() {
      appendHistoryBubble("user", turn.reply, turn.replyEn);
      if (typeAreaEl)    { typeAreaEl.remove();    typeAreaEl = null; }
      if (currentBotRow) { currentBotRow.remove(); currentBotRow = null; }
      updateKeyboard(null, []);

      var nextIdx = state.turnIdx + 1;
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
  var turn = SCRIPT[state.turnIdx];
  renderBotBubble(turn);
  setTimeout(function() { renderChoosePhase(turn); }, 280);
}

// ── Done screen ───────────────────────────────────────────────────────────
function showDoneScreen() {
  doneScoreEl.textContent = state.score + " / " + SCRIPT.length + " correct first tries";
  doneScreen.style.display = "flex";
}

// ── Restart ───────────────────────────────────────────────────────────────
function restartApp() {
  state.turnIdx = 0;
  state.score   = 0;
  state.chosen  = null;
  state.typed   = "";

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
kbToggleBtn.addEventListener("click", function() {
  state.kbVisible = !state.kbVisible;
  kbBody.style.display    = state.kbVisible ? "" : "none";
  kbToggleBtn.textContent = state.kbVisible ? "hide" : "show";
});

restartBtn.addEventListener("click", restartApp);

// ── Boot ──────────────────────────────────────────────────────────────────
buildKeyboard();
renderProgress();
startTurn();
