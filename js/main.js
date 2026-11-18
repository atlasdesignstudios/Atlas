/* ==========================================================================
   LUSIUS — Landing
   Único comportamiento: menú desplegable en móvil (≤ 760 px).
   ========================================================================== */
(function () {
  "use strict";

  /* Pausa las animaciones del hero cuando no se ve (solo ahorra CPU; el
     resultado visual es idéntico porque están fuera de pantalla). */
  var heroBg = document.querySelector(".hero__bg");
  if (heroBg && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      document.documentElement.classList.toggle("hero-paused", !visible);
    });
    heroObserver.observe(heroBg);
  }

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

/* ==========================================================================
   Auto-actualización
   GitHub Pages deja la página en caché del navegador hasta 10 minutos, así que
   tras publicar un cambio a veces se sigue viendo la versión vieja. Aquí se
   compara la copia en caché con la del servidor (una petición ligera que
   devuelve 304 si no hay cambios). Si difieren, se refrescan CSS, JS e
   imágenes y se recarga la página una sola vez.
   ========================================================================== */
(function () {
  "use strict";
  if (!("fetch" in window) || !window.Promise || location.protocol === "file:") return;

  var KEY = "lusius-update-check";
  var MIN_GAP = 30000; // no comprobar más de una vez cada 30 s

  function recently() {
    try {
      var last = +sessionStorage.getItem(KEY) || 0;
      if (Date.now() - last < MIN_GAP) return true;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch (e) { /* sin sessionStorage: se comprueba igualmente */ }
    return false;
  }

  function sameOriginAssets() {
    var urls = [];
    function add(u) {
      try {
        var a = new URL(u, location.href);
        if (a.origin === location.origin && urls.indexOf(a.href) < 0) urls.push(a.href);
      } catch (e) { /* url no válida */ }
    }
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"][href]'), function (n) { add(n.getAttribute("href")); });
    Array.prototype.forEach.call(document.querySelectorAll("script[src]"), function (n) { add(n.getAttribute("src")); });
    Array.prototype.forEach.call(document.querySelectorAll("img[src]"), function (n) { add(n.getAttribute("src")); });
    return urls;
  }

  function check() {
    if (recently()) return;
    var ae = document.activeElement;
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return; // no interrumpir un formulario
    var url = location.pathname + location.search;
    fetch(url, { cache: "force-cache" })
      .then(function (r) { return r.text(); })
      .then(function (cached) {
        return fetch(url, { cache: "no-cache" })
          .then(function (r) { return r.ok ? r.text() : cached; })
          .then(function (fresh) {
            if (fresh === cached) return;
            return Promise.all(sameOriginAssets().map(function (u) {
              return fetch(u, { cache: "reload" }).catch(function () {});
            })).then(function () { location.reload(); });
          });
      })
      .catch(function () { /* sin conexión: no pasa nada */ });
  }

  function start() { setTimeout(check, 1500); }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") check();
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) check(); });
})();

/* Vídeo decorativo de «Sobre Lusius»: se pausa fuera de pantalla y con «reducir movimiento» */
(function () {
  "use strict";
  var v = document.querySelector(".marble__video");
  if (!v) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { v.removeAttribute("autoplay"); v.pause(); return; }
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }).observe(v);
})();
