const DECLASSIFIED_CLASS = "dossier--declassified";
const LABEL_DECLASSIFY = "Desclasificar";
const LABEL_HIDE = "Ocultar";
const ICON_DECLASSIFY = "fa-lock-open";
const ICON_HIDE = "fa-lock";

export function initDossier() {
  const dossier = document.querySelector(".dossier");
  const toggle = document.querySelector(".dossier__toggle");
  if (!dossier || !toggle) return;

  const label = toggle.querySelector(".dossier__toggle-label");
  const icon = toggle.querySelector(".dossier__toggle-icon");

  // Hay JavaScript: el botón (oculto por defecto) ya tiene algo que hacer.
  toggle.hidden = false;

  // El estado lo comunica la etiqueta, que cambia: sin aria-pressed, para que
  // el lector de pantalla no anuncie el estado dos veces.
  toggle.addEventListener("click", () => {
    const declassified = dossier.classList.toggle(DECLASSIFIED_CLASS);
    label.textContent = declassified ? LABEL_HIDE : LABEL_DECLASSIFY;
    icon.classList.toggle(ICON_DECLASSIFY, !declassified);
    icon.classList.toggle(ICON_HIDE, declassified);
  });
}
