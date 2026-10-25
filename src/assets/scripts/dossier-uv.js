// Método «linterna UV»: una luz sigue al puntero y deja ver lo censurado.
// Un dato se fija cuando la luz ha pasado por todas sus celdas.
const LIT_CLASS = "dossier__header--lit";
const COLUMNS = 4;
const TOUCH_OFFSET = 48; // px por encima del dedo

export const uv = {
  id: "uv",
  hint: "Pasa la linterna UV sobre el expediente",
  // Sin mask-image no se puede agujerear la barra.
  supported: () =>
    CSS.supports("(mask-image: none) or (-webkit-mask-image: none)"),
  mount,
};

function mount({ header, redacted, revealedClass, onRevealed }) {
  let frame = 0;
  let pointer = null;
  let radius = 0;

  // Celdas ya iluminadas de cada dato. Un dato de una línea tiene una fila;
  // un párrafo tiene tantas como diámetros de luz caben en su alto.
  const litCells = new Map();

  const markCells = () => {
    let revealed = false;

    redacted.forEach((item) => {
      if (item.classList.contains(revealedClass)) return;

      const box = item.getBoundingClientRect();
      const x = pointer.x - box.left;
      if (pointer.y < box.top - radius || pointer.y > box.bottom + radius) {
        return;
      }
      if (x < 0 || x > box.width) return;

      const rows = Math.max(1, Math.round(box.height / (radius * 1.5)));
      const column = Math.min(
        COLUMNS - 1,
        Math.floor((x / box.width) * COLUMNS),
      );
      const row = Math.min(
        rows - 1,
        Math.max(0, Math.floor(((pointer.y - box.top) / box.height) * rows)),
      );

      const cells = litCells.get(item) ?? new Set();
      cells.add(row * COLUMNS + column);
      litCells.set(item, cells);

      if (cells.size === rows * COLUMNS) {
        item.classList.add(revealedClass);
        litCells.delete(item);
        revealed = true;
      }
    });

    if (revealed) onRevealed();
  };

  // Escribe la posición de la luz como mucho una vez por frame, relativa a
  // la caja de cada elemento: mask-image se posiciona respecto a ella.
  const paintLight = () => {
    frame = 0;
    markCells();
    [header, ...redacted].forEach((element) => {
      const box = element.getBoundingClientRect();
      element.style.setProperty("--dossier-uv-x", `${pointer.x - box.left}px`);
      element.style.setProperty("--dossier-uv-y", `${pointer.y - box.top}px`);
    });
  };

  const moveLight = (event) => {
    // El dedo taparía lo que ilumina: la luz se dibuja por encima.
    const offset = event.pointerType === "touch" ? TOUCH_OFFSET : 0;
    pointer = { x: event.clientX, y: event.clientY - offset };
    if (!frame) frame = requestAnimationFrame(paintLight);
  };

  // El radio vive en CSS (rem, y distinto en táctil): se mide en px con un
  // elemento auxiliar al encender la luz.
  const turnOn = () => {
    if (header.classList.contains(LIT_CLASS)) return;
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:var(--dossier-uv-r)";
    header.append(probe);
    radius = probe.offsetWidth;
    probe.remove();
    header.classList.add(LIT_CLASS);
  };

  const turnOff = () => header.classList.remove(LIT_CLASS);

  const events = {
    pointerdown: (event) => {
      turnOn();
      moveLight(event);
    },
    pointermove: (event) => {
      // El dedo solo mueve la luz mientras está apoyado (ya encendida).
      if (
        event.pointerType === "touch" &&
        !header.classList.contains(LIT_CLASS)
      ) {
        return;
      }
      turnOn();
      moveLight(event);
    },
    pointerup: (event) => {
      if (event.pointerType === "touch") turnOff();
    },
    pointerleave: turnOff,
    pointercancel: turnOff,
  };

  const listen = () =>
    Object.entries(events).forEach(([type, handler]) =>
      header.addEventListener(type, handler),
    );

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    turnOff();
    Object.entries(events).forEach(([type, handler]) =>
      header.removeEventListener(type, handler),
    );
  };

  listen();

  return {
    stop,
    restart: () => {
      litCells.clear();
      listen();
    },
    revealAll: () =>
      redacted.forEach((item) => item.classList.add(revealedClass)),
  };
}
