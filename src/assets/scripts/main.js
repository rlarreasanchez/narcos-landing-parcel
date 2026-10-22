/**
 * Import dependencies from node_modules
 */
import AOS from "aos";
import { initDossier } from "./dossier";
import { initNavbar } from "./navbar";
import { initQuote } from "./quote.js";
import { initThemeSong } from "./theme-song.js";

/**
 * Write any other JavaScript below
 */

// Hay JavaScript: se sustituye la clase de respaldo no-js por js.
document.documentElement.classList.replace("no-js", "js");

// Antes de AOS.init(), para que el cambio ocurra antes de la animación de entrada.
initQuote();

// AOS se desactiva si el usuario prefiere menos movimiento.
AOS.init({
  once: true,
  disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

initNavbar();
initDossier();
initThemeSong();
