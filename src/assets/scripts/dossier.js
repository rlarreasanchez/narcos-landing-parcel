import { scratch } from "./dossier-scratch";
import { swipe } from "./dossier-swipe";

const STORAGE_KEY = "narcos:dossier:last";
const DECLASSIFIED_CLASS = "dossier--declassified";
const REVEALED_CLASS = "dossier__redacted--revealed";
const AOS_ANIMATE_CLASS = "aos-animate";
const HINT_DONE = "Expediente desclasificado";
const STAMP_START = "Clasificado";
const STAMP_DONE = "Desclasificado";
const LABEL_REVEAL = "Revelar todo";
const LABEL_RESET = "Volver a clasificar";
const ICON_REVEAL = "fa-lock-open";
const ICON_RESET = "fa-lock";

// Cada método vive en su fichero y expone { id, hint, supported, mount }.
// mount() devuelve { stop, restart, revealAll }. Se turnan en este orden.
const METHODS = [scratch, swipe];

function readLastId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLastId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Sin localStorage: azar sin memoria entre recargas.
  }
}

// Elige el método siguiente al de la visita anterior, saltando los que el
// navegador no soporta. Si no hay memoria, uno al azar.
function pickMethod() {
  const available = METHODS.filter((method) => method.supported());
  const last = available.findIndex((method) => method.id === readLastId());
  const method =
    last === -1
      ? available[Math.floor(Math.random() * available.length)]
      : available[(last + 1) % available.length];
  saveLastId(method.id);
  return method;
}

export function initDossier() {
  const dossier = document.querySelector(".dossier");
  const header = document.querySelector(".dossier__header");
  const redacted = document.querySelectorAll(".dossier__redacted");
  const hint = document.querySelector(".dossier__hint");
  const reveal = document.querySelector(".dossier__reveal");
  const stamp = document.querySelector(".dossier__stamp");
  const label = reveal?.querySelector(".dossier__reveal-label");
  const icon = reveal?.querySelector(".dossier__reveal-icon");
  if (
    !dossier ||
    !header ||
    !redacted.length ||
    !hint ||
    !reveal ||
    !stamp ||
    !label ||
    !icon
  )
    return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const method = pickMethod();
  let completed = false;
  let controller = null;

  // Repite la caída del sello: AOS solo añade aos-animate, así que se quita
  // (sin transición, para que no se anime la salida), se fuerza un reflow y
  // se vuelve a añadir. Con reduced motion solo cambia el texto, sin caída.
  const replayStamp = () => {
    if (reducedMotion.matches || !stamp.classList.contains(AOS_ANIMATE_CLASS)) {
      return;
    }
    stamp.style.transition = "none";
    stamp.classList.remove(AOS_ANIMATE_CLASS);
    void stamp.offsetWidth;
    stamp.style.transition = "";
    stamp.classList.add(AOS_ANIMATE_CLASS);
  };

  // El botón nunca se deshabilita: así conserva el foco al cambiar de función.
  const setButton = (text, iconClass) => {
    label.textContent = text;
    icon.classList.remove(ICON_REVEAL, ICON_RESET);
    icon.classList.add(iconClass);
  };

  const complete = () => {
    if (completed) return;
    completed = true;

    dossier.classList.add(DECLASSIFIED_CLASS);
    // La pista es la región aria-live: es la que anuncia el cambio.
    hint.textContent = HINT_DONE;
    setButton(LABEL_RESET, ICON_RESET);
    stamp.textContent = STAMP_DONE;
    replayStamp();
    controller.stop();
  };

  // Cada método avisa cuando fija un dato; el expediente se completa con todos.
  const onRevealed = () => {
    if (
      [...redacted].every((item) => item.classList.contains(REVEALED_CLASS))
    ) {
      complete();
    }
  };

  // Devuelve el expediente al estado inicial sin recargar, con el mismo método.
  const reset = () => {
    if (!completed) return;
    completed = false;

    dossier.classList.remove(DECLASSIFIED_CLASS);
    redacted.forEach((item) => item.classList.remove(REVEALED_CLASS));
    hint.textContent = method.hint;
    setButton(LABEL_REVEAL, ICON_REVEAL);
    stamp.textContent = STAMP_START;
    replayStamp();
    controller.restart();
  };

  dossier.classList.add(`dossier--${method.id}`);
  controller = method.mount({
    header,
    redacted,
    reducedMotion,
    revealedClass: REVEALED_CLASS,
    onRevealed,
  });

  // Hay JavaScript: la pista y el botón (ocultos por defecto) ya tienen algo que hacer.
  hint.textContent = method.hint;
  hint.hidden = false;
  reveal.hidden = false;

  reveal.addEventListener("click", () => {
    if (completed) {
      reset();
      return;
    }
    controller.revealAll();
    complete();
  });
}
