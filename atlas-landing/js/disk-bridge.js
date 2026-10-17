/* ==========================================================================
   ATLAS — Puente para abrir la web desde el disco (file://)
   SOLO actúa cuando abres los .html directamente desde una carpeta.
   En una web publicada (https://…) no hace nada.

   Problema: Firefox y Safari (y otros) dan a cada archivo .html su propio
   almacenamiento. Resultado: la cesta y la elección de cookies «desaparecen»
   al cambiar de página, y reaparecen al volver a la página donde se hicieron.

   Solución: al pasar de una página a otra, los enlaces llevan una copia de la
   cesta y del consentimiento en la propia dirección (?atlas_state=…). La
   página que se abre la recoge, la guarda y limpia la dirección.

   Debe cargarse ANTES que cart.js y cookies.js.
   ========================================================================== */
(function () {
  "use strict";

  if (window.location.protocol !== "file:") return;

  var KEYS = ["atlas_cart", "atlas_cookie_consent"];
  var PARAM = "atlas_state";

  function enc(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function dec(str) {
    var b = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  }
  function stamp(raw) {                       // marca de tiempo de un valor guardado (0 si no sirve)
    try { var d = JSON.parse(raw); return d && typeof d.ts === "number" ? d.ts : 0; } catch (e) { return 0; }
  }
  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }

  /* 1. RECIBIR: si la dirección trae datos, se guardan (gana lo más reciente) */
  try {
    var url = new URL(window.location.href);
    var raw = url.searchParams.get(PARAM);
    if (raw) {
      var st = dec(raw);
      KEYS.forEach(function (k) {
        if (typeof st[k] !== "string") return;
        if (stamp(st[k]) > stamp(get(k) || "")) set(k, st[k]);
      });
      url.searchParams.delete(PARAM);
      try { window.history.replaceState(null, "", url.pathname + url.search + url.hash); } catch (e) { /* ignorar */ }
    }
  } catch (e) { /* dirección con datos dañados: se ignoran */ }

  /* 2. ENVIAR: justo antes de usar un enlace local se le añade el estado actual */
  function decorate(a) {
    var href0 = a.getAttribute("data-href0");
    if (href0 === null) { href0 = a.getAttribute("href"); if (href0) a.setAttribute("data-href0", href0); }
    if (!href0 || href0.charAt(0) === "#") return;
    var u;
    try { u = new URL(href0, window.location.href); } catch (e) { return; }
    if (u.protocol !== "file:" || !/\.html?$/i.test(u.pathname)) return;

    var st = {}, any = false;
    KEYS.forEach(function (k) { var v = get(k); if (v) { st[k] = v; any = true; } });
    if (!any) { a.setAttribute("href", href0); return; }
    u.searchParams.set(PARAM, enc(st));
    a.href = u.href;
  }
  function onUse(e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (a) decorate(a);
  }
  ["pointerdown", "mouseover", "touchstart", "focusin", "contextmenu", "click", "auxclick"].forEach(function (t) {
    document.addEventListener(t, onUse, true);
  });
})();
