// Método «rascador»: un canvas del color de la barra se rasca con el puntero.
// Un dato se revela cuando se ha rascado más del 70 % de su barra.
const SCRATCH_READY_CLASS = "dossier__redacted--scratch";
const BRUSH_RADIUS = 14; // px CSS
const REVEAL_THRESHOLD = 0.7;
const SAMPLE_MS = 150;
const FADE_MS = 200;

export const scratch = {
  id: "scratch",
  hint: "Rasca las barras para leer el expediente",
  supported: () => true,
  mount,
};

function mount({ redacted, revealedClass, reducedMotion, onRevealed }) {
  // Estado de cada canvas mientras su dato no está revelado.
  const scratches = new Map();
  const observers = new Map();

  // Color de la barra ::after, leído antes de que el canvas la sustituya.
  const barColor = getComputedStyle(redacted[0], "::after").backgroundColor;

  // Pinta el canvas entero en el color de la barra, con el tamaño actual del dato.
  const paint = (canvas, ctx) => {
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    const state = scratches.get(canvas);
    if (state) {
      state.size = { width, height };
      state.last = null;
    }
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = barColor;
    ctx.fillRect(0, 0, width, height);
  };

  // Pincel de borde irregular: un polígono con el radio variable en cada vértice.
  const dab = (ctx, x, y) => {
    const vertices = 12;
    ctx.beginPath();
    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2;
      const radius = BRUSH_RADIUS * (0.8 + Math.random() * 0.35);
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };

  // Interpola entre dos eventos para que un movimiento rápido no deje huecos.
  const stroke = (ctx, from, to) => {
    const step = BRUSH_RADIUS / 3;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const count = Math.max(1, Math.ceil(distance / step));
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      dab(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  // Fracción rascada: píxeles casi transparentes en una rejilla de 1 de cada 4.
  const scratchedRatio = (canvas, ctx) => {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 16) {
      total++;
      if (data[i] < 128) cleared++;
    }
    return total ? cleared / total : 0;
  };

  const revealItem = (item, fade = false) => {
    const canvas = item.querySelector(".dossier__scratch");
    item.classList.add(revealedClass);
    observers.get(item)?.disconnect();
    observers.delete(item);
    if (!canvas) return;

    scratches.delete(canvas);
    // Con reduced motion el canvas desaparece sin fundido.
    if (fade && !reducedMotion.matches) {
      canvas.style.opacity = "0";
      canvas.style.pointerEvents = "none";
      setTimeout(() => canvas.remove(), FADE_MS);
    } else {
      canvas.remove();
    }
  };

  // Mide como mucho cada SAMPLE_MS, salvo que se fuerce (al soltar el puntero).
  const sample = (item, canvas, force = false) => {
    const state = scratches.get(canvas);
    const now = performance.now();
    if (!state || (!force && now - state.lastSample < SAMPLE_MS)) return;

    state.lastSample = now;
    if (scratchedRatio(canvas, state.ctx) > REVEAL_THRESHOLD) {
      revealItem(item, true);
      onRevealed();
    }
  };

  const pointFrom = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const listen = (item, canvas) => {
    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const state = scratches.get(canvas);
      if (!state) return;

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      state.last = pointFrom(canvas, event);
      stroke(state.ctx, state.last, state.last);
    });

    canvas.addEventListener("pointermove", (event) => {
      const state = scratches.get(canvas);
      if (!state?.last || !canvas.hasPointerCapture(event.pointerId)) return;

      const point = pointFrom(canvas, event);
      stroke(state.ctx, state.last, point);
      state.last = point;
      sample(item, canvas);
    });

    const release = (event) => {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      const state = scratches.get(canvas);
      if (!state) return;

      state.last = null;
      sample(item, canvas, true);
    };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
  };

  // Si la barra cambia de tamaño (rotación, redimensionado) se repinta entera.
  const observe = (item, canvas) => {
    const observer = new ResizeObserver(() => {
      const state = scratches.get(canvas);
      if (!state) return;

      const { width, height } = item.getBoundingClientRect();
      if (width !== state.size.width || height !== state.size.height) {
        paint(canvas, state.ctx);
      }
    });
    observer.observe(item);
    observers.set(item, observer);
  };

  const addScratch = (item) => {
    if (
      item.classList.contains(revealedClass) ||
      item.querySelector(".dossier__scratch")
    ) {
      return;
    }

    // Sin canvas el dato conserva su barra ::after: solo queda «Revelar todo».
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.className = "dossier__scratch";
    canvas.setAttribute("aria-hidden", "true");
    item.append(canvas);
    scratches.set(canvas, { ctx, last: null, lastSample: 0, size: null });
    paint(canvas, ctx);
    listen(item, canvas);
    item.classList.add(SCRATCH_READY_CLASS);
    observe(item, canvas);
  };

  const clear = () => {
    observers.forEach((observer) => observer.disconnect());
    observers.clear();
    redacted.forEach((item) => {
      item.classList.remove(SCRATCH_READY_CLASS);
      item.querySelectorAll(".dossier__scratch").forEach((canvas) => {
        scratches.delete(canvas);
        canvas.remove();
      });
    });
  };

  // Las fuentes web cambian el tamaño de los datos: se pinta cuando ya están.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    redacted.forEach(addScratch);
  });

  return {
    stop: () => observers.forEach((observer) => observer.disconnect()),
    // Deja canvas nuevos y limpios sobre cada dato.
    restart: () => {
      clear();
      redacted.forEach(addScratch);
    },
    revealAll: () => redacted.forEach((item) => revealItem(item)),
  };
}
