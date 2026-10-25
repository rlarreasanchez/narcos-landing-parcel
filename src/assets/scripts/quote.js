import quotes from "../data/quotes.json";

const STORAGE_KEY = "narcos:quote:last";
const CHANGING_CLASS = "quote--changing";
const FADE_MS = 300;

function readLastIndex() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    const index = Number(value);
    // Un valor corrupto se ignora si no es un índice válido.
    return value !== null && Number.isInteger(index) && quotes[index]
      ? index
      : -1;
  } catch {
    return -1;
  }
}

function saveLastIndex(index) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // Sin sessionStorage: la siguiente recarga puede repetir la frase.
  }
}

function pickIndex(excluded) {
  if (quotes.length < 2) return 0;
  let index;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === excluded);
  return index;
}

function renderCaption(caption, { author, season }) {
  const cite = document.createElement("cite");
  cite.textContent = "Narcos";
  caption.replaceChildren(`${author} — `, cite, `, temporada ${season}`);
}

export function initQuote() {
  const quote = document.querySelector(".quote");
  if (!quote || quotes.length === 0) return;

  const text = quote.querySelector(".quote__text");
  const caption = quote.querySelector(".quote__caption");
  const next = quote.querySelector(".quote__next");
  if (!text || !caption || !next) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = -1;
  let changing = false;

  function show(index) {
    const paragraph = document.createElement("p");
    paragraph.textContent = quotes[index].text;
    text.replaceChildren(paragraph);
    renderCaption(caption, quotes[index]);
    current = index;
    saveLastIndex(index);
  }

  show(pickIndex(readLastIndex()));
  next.hidden = false;

  next.addEventListener("click", () => {
    if (changing) return;
    const index = pickIndex(current);

    if (reducedMotion.matches) {
      show(index);
      return;
    }

    changing = true;
    quote.classList.add(CHANGING_CLASS);
    setTimeout(() => {
      show(index);
      quote.classList.remove(CHANGING_CLASS);
      changing = false;
    }, FADE_MS);
  });
}
