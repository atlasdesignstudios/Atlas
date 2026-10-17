/* ==========================================================================
   ATLAS — Catálogo
   Cambia entre la vista delantera y trasera de cada prenda.
   Sin JavaScript se muestra siempre la vista delantera (y el selector queda oculto).
   ========================================================================== */
(function () {
  "use strict";

  var cards = document.querySelectorAll("[data-product]");

  Array.prototype.forEach.call(cards, function (card) {
    var toggle = card.querySelector(".view-toggle");
    if (!toggle) return;

    var imgs = card.querySelectorAll(".card__img");
    var buttons = toggle.querySelectorAll("button[data-set-view]");

    function show(view) {
      Array.prototype.forEach.call(imgs, function (img) {
        img.hidden = img.getAttribute("data-view") !== view;
      });
      Array.prototype.forEach.call(buttons, function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-set-view") === view));
      });
    }

    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-set-view]");
      if (btn) show(btn.getAttribute("data-set-view"));
    });

    toggle.hidden = false; // hay JS: se muestra el selector
  });
})();
