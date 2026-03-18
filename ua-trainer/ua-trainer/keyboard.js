// ── Ukrainian ↔ English keyboard map ────────────────────────────────────
// Maps English key label → Ukrainian letter it produces.
// Only Cyrillic letters are mapped here.
// Spaces, punctuation (!  ' , . — 😂 😄) are typed directly — no mapping needed.
const KEY_MAP = {
  q:"й", w:"ц", e:"у", r:"к", t:"е", y:"н", u:"г", i:"ш",
  o:"щ", p:"з", "[":"х", "]":"ї",
  a:"ф", s:"і", d:"в", f:"а", g:"п", h:"р", j:"о", k:"л",
  l:"д", ";":"ж", "'":"є",
  z:"я", x:"ч", c:"с", v:"м", b:"и", n:"т", m:"ь",
  ",":"б", ".":"ю",
};

// Reverse lookup: lowercase Ukrainian char → English key
const UA_TO_EN = {};
Object.entries(KEY_MAP).forEach(([en, ua]) => {
  if (!UA_TO_EN[ua]) UA_TO_EN[ua] = en;
});

/**
 * Return the English key needed to type a Ukrainian character.
 * Returns null for spaces, punctuation, emoji — those are typed directly,
 * no keyboard highlight needed.
 */
function getEnKey(ch) {
  if (!ch) return null;
  // Punctuation / emoji typed as-is on any keyboard
  const passThrough = [" ", "!", "?", ",", ".", "'", "—", "😂", "😄", "'", "\""];
  if (passThrough.includes(ch)) return null;
  return UA_TO_EN[ch.toLowerCase()] || null;
}

/**
 * Human-readable label for the "next key" hint chips.
 */
function getKeyLabel(ch) {
  if (!ch) return null;
  if (ch === " ")  return "Space";
  if (ch === "!")  return "! (Shift+1)";
  if (ch === "?")  return "? (Shift+/)";
  if (ch === ",")  return ",";
  if (ch === ".")  return ".";
  if (ch === "'")  return "' (apostrophe)";
  if (ch === "—")  return "— (em dash)";
  if (ch === "😂" || ch === "😄") return ch + " (emoji)";
  const en = UA_TO_EN[ch.toLowerCase()];
  return en ? en.toUpperCase() : ch;
}

// ── Keyboard rows for visual display ─────────────────────────────────────
const KB_ROWS = [
  [
    {ua:"й",en:"Q"},{ua:"ц",en:"W"},{ua:"у",en:"E"},{ua:"к",en:"R"},
    {ua:"е",en:"T"},{ua:"н",en:"Y"},{ua:"г",en:"U"},{ua:"ш",en:"I"},
    {ua:"щ",en:"O"},{ua:"з",en:"P"},{ua:"х",en:"["},{ua:"ї",en:"]"},
  ],
  [
    {ua:"ф",en:"A"},{ua:"і",en:"S"},{ua:"в",en:"D"},{ua:"а",en:"F"},
    {ua:"п",en:"G"},{ua:"р",en:"H"},{ua:"о",en:"J"},{ua:"л",en:"K"},
    {ua:"д",en:"L"},{ua:"ж",en:";"},{ua:"є",en:"'"},
  ],
  [
    {ua:"я",en:"Z"},{ua:"ч",en:"X"},{ua:"с",en:"C"},{ua:"м",en:"V"},
    {ua:"и",en:"B"},{ua:"т",en:"N"},{ua:"ь",en:"M"},{ua:"б",en:","},{ua:"ю",en:"."},
  ],
];

const ROW_OFFSETS = [0, 10, 22];

/** Build the keyboard DOM once and attach to #kb-layout */
function buildKeyboard() {
  const container = document.getElementById("kb-layout");
  container.innerHTML = "";

  KB_ROWS.forEach((row, ri) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    rowEl.style.paddingLeft = ROW_OFFSETS[ri] + "px";

    row.forEach(({ ua, en }) => {
      const key = document.createElement("div");
      key.className = "kb-key";
      key.dataset.en = en.toLowerCase(); // store lowercase for matching

      const uaSpan = document.createElement("span");
      uaSpan.className = "kb-key-ua";
      uaSpan.textContent = ua.toUpperCase();

      const enSpan = document.createElement("span");
      enSpan.className = "kb-key-en";
      enSpan.textContent = en;

      key.appendChild(uaSpan);
      key.appendChild(enSpan);
      rowEl.appendChild(key);
    });

    container.appendChild(rowEl);
  });
}

/**
 * Highlight keyboard keys.
 * @param {string|null} activeEN   - key to glow gold
 * @param {string[]}    upcomingEN - next few keys to dim-highlight
 */
function updateKeyboard(activeEN, upcomingEN = []) {
  document.querySelectorAll(".kb-key").forEach(k =>
    k.classList.remove("key-active", "key-upcoming")
  );

  if (activeEN) {
    const el = document.querySelector(`.kb-key[data-en="${activeEN.toLowerCase()}"]`);
    if (el) el.classList.add("key-active");
  }

  upcomingEN.forEach(en => {
    if (!en) return;
    const el = document.querySelector(`.kb-key[data-en="${en.toLowerCase()}"]`);
    if (el && !el.classList.contains("key-active")) el.classList.add("key-upcoming");
  });

  // Info panel
  const infoBox = document.getElementById("active-key-info");
  const enLabel = document.getElementById("active-en");
  const uaLabel = document.getElementById("active-ua");

  if (activeEN && infoBox) {
    enLabel.textContent = activeEN.toUpperCase();
    uaLabel.textContent = KEY_MAP[activeEN.toLowerCase()] || activeEN;
    infoBox.style.display = "flex";
  } else if (infoBox) {
    infoBox.style.display = "none";
  }
}
