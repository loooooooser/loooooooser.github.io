// ── Ukrainian ↔ English keyboard map ────────────────────────────────────
const KEY_MAP = {
  q:"й", w:"ц", e:"у", r:"к", t:"е", y:"н", u:"г", i:"ш",
  o:"щ", p:"з", "[":"х", "]":"ї",
  a:"ф", s:"і", d:"в", f:"а", g:"п", h:"р", j:"о", k:"л",
  l:"д", ";":"ж", "'":"є",
  z:"я", x:"ч", c:"с", v:"м", b:"и", n:"т", m:"ь",
  ",":"б", ".":"ю",
};

// Reverse: Ukrainian char → English key
const UA_TO_EN = {};
Object.entries(KEY_MAP).forEach(([en, ua]) => {
  if (!UA_TO_EN[ua]) UA_TO_EN[ua] = en;
});

// Keyboard rows for visual display
const KB_ROWS = [
  [
    {ua:"й",en:"q"},{ua:"ц",en:"w"},{ua:"у",en:"e"},{ua:"к",en:"r"},
    {ua:"е",en:"t"},{ua:"н",en:"y"},{ua:"г",en:"u"},{ua:"ш",en:"i"},
    {ua:"щ",en:"o"},{ua:"з",en:"p"},{ua:"х",en:"["},{ua:"ї",en:"]"},
  ],
  [
    {ua:"ф",en:"a"},{ua:"і",en:"s"},{ua:"в",en:"d"},{ua:"а",en:"f"},
    {ua:"п",en:"g"},{ua:"р",en:"h"},{ua:"о",en:"j"},{ua:"л",en:"k"},
    {ua:"д",en:"l"},{ua:"ж",en:";"},{ua:"є",en:"'"},
  ],
  [
    {ua:"я",en:"z"},{ua:"ч",en:"x"},{ua:"с",en:"c"},{ua:"м",en:"v"},
    {ua:"и",en:"b"},{ua:"т",en:"n"},{ua:"ь",en:"m"},{ua:"б",en:","},{ua:"ю",en:"."},
  ],
];

// Row left-offsets (px) to simulate staggered keyboard layout
const ROW_OFFSETS = [0, 8, 18];

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
      key.dataset.en = en;

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
 * Update keyboard highlights.
 * @param {string} activeEN  - the English key to highlight gold (next char to type)
 * @param {string[]} upcomingEN - next few English keys (dimly highlighted)
 */
function updateKeyboard(activeEN, upcomingEN = []) {
  const allKeys = document.querySelectorAll(".kb-key");
  allKeys.forEach(k => {
    k.classList.remove("key-active", "key-upcoming");
  });

  if (activeEN) {
    const activeEl = document.querySelector(`.kb-key[data-en="${CSS.escape(activeEN)}"]`);
    if (activeEl) activeEl.classList.add("key-active");
  }

  upcomingEN.forEach(en => {
    const el = document.querySelector(`.kb-key[data-en="${CSS.escape(en)}"]`);
    if (el && !el.classList.contains("key-active")) el.classList.add("key-upcoming");
  });

  // Active key info panel
  const infoBox = document.getElementById("active-key-info");
  const enLabel = document.getElementById("active-en");
  const uaLabel = document.getElementById("active-ua");

  if (activeEN) {
    const uaChar = KEY_MAP[activeEN] || activeEN;
    enLabel.textContent = activeEN.toUpperCase();
    uaLabel.textContent = uaChar;
    infoBox.style.display = "flex";
  } else {
    infoBox.style.display = "none";
  }
}

/** Get the English key for a Ukrainian character */
function getEnKey(uaChar) {
  return UA_TO_EN[uaChar] || null;
}
