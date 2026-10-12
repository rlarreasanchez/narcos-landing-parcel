/**
 * Import dependencies from node_modules
 */
import AOS from "aos";

/**
 * Write any other JavaScript below
 */

// Hay JavaScript: se sustituye la clase de respaldo no-js por js.
document.documentElement.classList.replace("no-js", "js");

// AOS se desactiva si el usuario prefiere menos movimiento.
AOS.init({
  once: true,
  disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});
