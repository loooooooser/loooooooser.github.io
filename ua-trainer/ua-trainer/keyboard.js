// ─────────────────────────────────────────────────────────────────────────
// UKRAINIAN KEYBOARD MAP
// Standard Ukrainian layout as typed on a US-QWERTY physical keyboard.
//
// Key  → Ukrainian letter it produces
// q=й  w=ц  e=у  r=к  t=е  y=н  u=г  i=ш  o=щ  p=з  [=х  ]=ї
// a=ф  s=і  d=в  f=а  g=п  h=р  j=о  k=л  l=д  ;=ж  '=є
// z=я  x=ч  c=с  v=м  b=и  n=т  m=ь  ,=б  .=ю
// ─────────────────────────────────────────────────────────────────────────

// EN key (lowercase) → Ukrainian letter
const KEY_MAP = {
  "q":"й","w":"ц","e":"у","r":"к","t":"е","y":"н","u":"г","i":"ш",
  "o":"щ","p":"з","[":"х","]":"ї",
  "a":"ф","s":"і","d":"в","f":"а","g":"п","h":"р","j":"о","k":"л",
  "l":"д",";":"ж","'":"є",
  "z":"я","x":"ч","c":"с","v":"м","b":"и","n":"т","m":"ь",
  ",":"б",".":"ю"
};

// Ukrainian letter (lowercase) → EN key that produces it
const UA_TO_EN = {};
for (const [en, ua] of Object.entries(KEY_MAP)) {
  UA_TO_EN[ua] = en;
}

/**
 * Return the EN key needed to type a Ukrainian character.
 * Returns null for space — space is just the spacebar, no hint needed.
 */
function getEnKey(ch) {
  if (!ch || ch === " ") return null;
  return UA_TO_EN[ch.toLowerCase()] || null;
}

/**
 * Return a display label for the "next key" hint chips.
 * Returns null if no label is appropriate.
 */
function getKeyLabel(ch) {
  if (!ch) return null;
  if (ch === " ") return "Space";
  const en = UA_TO_EN[ch.toLowerCase()];
  return en ? en.toUpperCase() : null;
}

// ─────────────────────────────────────────────────────────────────────────
// KEYBOARD ROWS (visual display — ua shown on key, en shown underneath)
// ─────────────────────────────────────────────────────────────────────────
const KB_ROWS = [
  // Row 1
  [
    {ua:"й",en:"q"},{ua:"ц",en:"w"},{ua:"у",en:"e"},{ua:"к",en:"r"},
    {ua:"е",en:"t"},{ua:"н",en:"y"},{ua:"г",en:"u"},{ua:"ш",en:"i"},
    {ua:"щ",en:"o"},{ua:"з",en:"p"}
  ],
  // Row 2
  [
    {ua:"ф",en:"a"},{ua:"і",en:"s"},{ua:"в",en:"d"},{ua:"а",en:"f"},
    {ua:"п",en:"g"},{ua:"р",en:"h"},{ua:"о",en:"j"},{ua:"л",en:"k"},
    {ua:"д",en:"l"}
  ],
  // Row 3
  [
    {ua:"я",en:"z"},{ua:"ч",en:"x"},{ua:"с",en:"c"},{ua:"м",en:"v"},
    {ua:"и",en:"b"},{ua:"т",en:"n"},{ua:"ь",en:"m"},{ua:"б",en:","},{ua:"ю",en:"."}
  ]
];

// Row left-offsets to simulate staggered keyboard look
const ROW_OFFSETS = ["0px", "10px", "22px"];

// ─────────────────────────────────────────────────────────────────────────
// BUILD KEYBOARD DOM
// ─────────────────────────────────────────────────────────────────────────
function buildKeyboard() {
  const container = document.getElementById("kb-layout");
  container.innerHTML = "";

  KB_ROWS.forEach((row, ri) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    rowEl.style.paddingLeft = ROW_OFFSETS[ri];

    row.forEach(({ ua, en }) => {
      const keyEl = document.createElement("div");
      keyEl.className = "kb-key";
      // data-en stores the EN key in lowercase for querySelector matching
      keyEl.dataset.en = en;

      const uaSpan = document.createElement("span");
      uaSpan.className = "kb-key-ua";
      uaSpan.textContent = ua.toUpperCase();

      const enSpan = document.createElement("span");
      enSpan.className = "kb-key-en";
      enSpan.textContent = en.toUpperCase();

      keyEl.appendChild(uaSpan);
      keyEl.appendChild(enSpan);
      rowEl.appendChild(keyEl);
    });

    container.appendChild(rowEl);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// UPDATE KEYBOARD HIGHLIGHTS
// activeEN   = the EN key to glow gold (the one to press next)
// upcomingEN = array of the next few EN keys to dim-highlight
// ─────────────────────────────────────────────────────────────────────────
function updateKeyboard(activeEN, upcomingEN) {
  upcomingEN = upcomingEN || [];

  // Clear all highlights
  document.querySelectorAll(".kb-key").forEach(k => {
    k.classList.remove("key-active", "key-upcoming");
  });

  // Highlight active key gold
  if (activeEN) {
    const el = document.querySelector('.kb-key[data-en="' + activeEN + '"]');
    if (el) el.classList.add("key-active");
  }

  // Dim-highlight upcoming keys
  upcomingEN.forEach(function(en) {
    if (!en) return;
    const el = document.querySelector('.kb-key[data-en="' + en + '"]');
    if (el && !el.classList.contains("key-active")) {
      el.classList.add("key-upcoming");
    }
  });

  // Update the "press X → У" info panel
  const infoBox = document.getElementById("active-key-info");
  const enLabel = document.getElementById("active-en");
  const uaLabel = document.getElementById("active-ua");

  if (activeEN && infoBox) {
    enLabel.textContent = activeEN.toUpperCase();
    uaLabel.textContent = KEY_MAP[activeEN] ? KEY_MAP[activeEN].toUpperCase() : activeEN;
    infoBox.style.display = "flex";
  } else if (infoBox) {
    infoBox.style.display = "none";
  }
}
