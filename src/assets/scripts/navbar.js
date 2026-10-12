const OPEN_CLASS = "navbar__menu--open";
const LABEL_OPEN = "Abrir menú";
const LABEL_CLOSE = "Cerrar menú";

export function initNavbar() {
  const toggle = document.querySelector(".navbar__toggle");
  const menu = document.getElementById("navbar-menu");
  if (!toggle || !menu) return;

  const label = toggle.querySelector(".navbar__toggle-label");
  const icon = toggle.querySelector(".navbar__icon");

  function setOpen(open) {
    menu.classList.toggle(OPEN_CLASS, open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? LABEL_CLOSE : LABEL_OPEN;
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
  }

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Escape cierra el menú y devuelve el foco al botón.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Al pulsar un enlace del menú, se cierra.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
}
