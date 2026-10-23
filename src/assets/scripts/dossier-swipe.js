// Método «borrar al pasar»: la barra se recoge al pasar el cursor o el dedo,
// en la dirección por la que entra el gesto.
const FROM_RIGHT_CLASS = "dossier__redacted--from-right";

export const swipe = {
  id: "swipe",
  hint: "Pasa el cursor o el dedo por las barras",
  supported: () => true,
  mount,
};

function mount({ header, redacted, revealedClass, onRevealed }) {
  // Sin x (botón «Revelar todo») la barra se recoge hacia la derecha.
  const revealItem = (item, x) => {
    if (item.classList.contains(revealedClass)) return;
    if (x !== undefined) {
      const { left, width } = item.getBoundingClientRect();
      item.classList.toggle(FROM_RIGHT_CLASS, x > left + width / 2);
    }
    item.classList.add(revealedClass);
    onRevealed();
  };

  // Los listeners de puntero comparten un AbortController: al parar se
  // cancelan todos de una vez y no hace falta guardar cada referencia.
  let touchId = null;
  let listeners = null;

  const listen = () => {
    listeners = new AbortController();
    const { signal } = listeners;

    redacted.forEach((item) => {
      // Ratón y lápiz: basta con pasar por encima, sin pulsar.
      item.addEventListener(
        "pointerenter",
        (event) => {
          if (event.pointerType === "touch") return;
          revealItem(item, event.clientX);
        },
        { signal },
      );

      // Dedo: tocar retira la barra y arrastrar retira las que cruza.
      item.addEventListener(
        "pointerdown",
        (event) => {
          if (event.pointerType !== "touch") return;
          touchId = event.pointerId;
          revealItem(item, event.clientX);
        },
        { signal },
      );
    });

    // El dedo tiene captura implícita y pointerenter no llega a los demás
    // datos: se localiza el dato bajo el dedo con elementFromPoint.
    header.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerId !== touchId) return;
        const under = document.elementFromPoint(event.clientX, event.clientY);
        const item = under?.closest(".dossier__redacted");
        if (item) revealItem(item, event.clientX);
      },
      { signal },
    );

    const endTouch = (event) => {
      if (event.pointerId === touchId) touchId = null;
    };
    header.addEventListener("pointerup", endTouch, { signal });
    header.addEventListener("pointercancel", endTouch, { signal });
  };

  listen();

  return {
    stop: () => {
      listeners.abort();
      touchId = null;
    },
    restart: () => {
      redacted.forEach((item) => item.classList.remove(FROM_RIGHT_CLASS));
      listen();
    },
    revealAll: () => redacted.forEach((item) => revealItem(item)),
  };
}
