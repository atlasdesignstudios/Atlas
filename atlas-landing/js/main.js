/* ==========================================================================
   ATLAS — Landing
   Único comportamiento: menú desplegable en móvil (≤ 760 px).
   ========================================================================== */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (!header || !toggle || !menu) return;

  // Abre o cierra el menú y mantiene aria-expanded sincronizado
  function setOpen(open) {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-open"));
  });

  // Cierra al elegir un enlace
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  // Cierra con Escape y devuelve el foco al botón
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Si se agranda la ventana a escritorio, deja el menú cerrado y limpio
  window.matchMedia("(min-width: 761px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();
