const VIDEO_ID = "PtJ6yAGjsIs"; // Cabecera oficial de Narcos, canal de Netflix
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`;
const OPEN_CLASS = "theme-song--open";

function createFrame() {
  const frame = document.createElement("iframe");
  frame.className = "video__frame";
  frame.src = EMBED_URL;
  frame.title = "Cabecera oficial de Narcos con la sintonía «Tuyo» (YouTube)";
  frame.allow = "autoplay; encrypted-media; picture-in-picture";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allowFullscreen = true;
  return frame;
}

export function initThemeSong() {
  const themeSong = document.querySelector(".theme-song");
  if (!themeSong) return;

  const player = themeSong.querySelector(".theme-song__player");
  const play = themeSong.querySelector(".theme-song__play");
  const close = themeSong.querySelector(".theme-song__close");
  const notice = themeSong.querySelector(".theme-song__notice");
  const fallback = themeSong.querySelector(".theme-song__fallback");
  if (!player || !play || !close || !notice || !fallback) return;

  // Hay JavaScript: el botón y el aviso ya tienen algo que hacer, y el enlace
  // de respaldo sobra.
  play.hidden = false;
  notice.hidden = false;
  fallback.hidden = true;

  play.addEventListener("click", () => {
    player.append(createFrame());
    player.hidden = false;
    play.hidden = true;
    notice.hidden = true;
    close.hidden = false;
    themeSong.classList.add(OPEN_CLASS);
    // El botón pulsado desaparece: el foco pasa al que lo sustituye.
    close.focus();
  });

  close.addEventListener("click", () => {
    // Quitar el iframe del DOM detiene el audio.
    player.replaceChildren();
    player.hidden = true;
    close.hidden = true;
    play.hidden = false;
    notice.hidden = false;
    themeSong.classList.remove(OPEN_CLASS);
    // El botón pulsado desaparece: el foco vuelve al que abre el reproductor.
    play.focus();
  });
}
