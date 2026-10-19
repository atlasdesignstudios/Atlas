/* ==========================================================================
   ATLAS — Gestor de consentimiento de cookies
   Cumple los criterios habituales de la AEPD (Guía sobre el uso de cookies):
   · «Aceptar todas», «Rechazar todas» y «Configurar» con el mismo aspecto.
   · Nada que no sea técnico se activa sin consentimiento previo y explícito.
   · Seguir navegando o hacer scroll NO cuenta como consentimiento.
   · El usuario puede cambiar su elección en cualquier momento
     (enlace «Configurar cookies» del footer).
   · La elección caduca a los 12 meses (la Guía admite un máximo de 24).

   CÓMO USARLO CON SCRIPTS DE TERCEROS (analítica, píxeles, etc.)
   No los cargues directamente. Escríbelos así y se activarán solo si el
   usuario acepta esa categoría:

     <script type="text/plain" data-consent="analytics" src="https://…"></script>
     <script type="text/plain" data-consent="marketing">  …tu código aquí…  </script>

   Categorías: "analytics" y "marketing". Las técnicas no necesitan consentimiento.
   Para reaccionar al consentimiento desde tu código:
     document.addEventListener("atlas:consent", function (e) { e.detail.analytics … });
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "atlas_cookie_consent";
  var VERSION = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 meses

  // Ruta a la política de cookies, calculada respecto a este mismo archivo
  var me = document.currentScript;
  var policyUrl = new URL("../legal/cookies.html", me ? me.src : location.href).href;

  var banner = null;

  /* ---------- Almacenamiento (con try/catch: puede estar bloqueado) ---------- */
  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || c.v !== VERSION || typeof c.ts !== "number") return null;
      if (Date.now() - c.ts > MAX_AGE_MS) return null; // caducado: preguntar de nuevo
      return c;
    } catch (e) { return null; }
  }

  function save(analytics, marketing) {
    var c = { v: VERSION, ts: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { window.localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ }
    return c;
  }

  /* ---------- Activación de scripts condicionados al consentimiento ---------- */
  function activate(c) {
    var pending = document.querySelectorAll('script[type="text/plain"][data-consent]');
    Array.prototype.forEach.call(pending, function (node) {
      var cat = node.getAttribute("data-consent");
      if (!c[cat] || node.getAttribute("data-activated")) return;
      var s = document.createElement("script");
      Array.prototype.forEach.call(node.attributes, function (a) {
        if (a.name !== "type" && a.name !== "data-consent") s.setAttribute(a.name, a.value);
      });
      s.text = node.text;
      node.setAttribute("data-activated", "1");
      node.parentNode.insertBefore(s, node.nextSibling);
    });
    document.dispatchEvent(new CustomEvent("atlas:consent", { detail: c }));
  }

  /* ---------- Interfaz ---------- */
  function build() {
    var el = document.createElement("div");
    el.className = "cookie-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", "ck-title");
    el.setAttribute("aria-describedby", "ck-desc");
    el.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<div class="cookie-banner__text">' +
          '<p class="cookie-banner__title" id="ck-title" tabindex="-1">Tu privacidad</p>' +
          '<p id="ck-desc">Usamos almacenamiento técnico imprescindible para que la web funcione. ' +
          'Las cookies de analítica y marketing solo se activan si las aceptas. ' +
          'Puedes aceptarlas, rechazarlas o elegir por categorías. ' +
          'Más información en la <a data-policy href="#">Política de cookies</a>.</p>' +
        '</div>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="cookie-btn" data-ck="reject">Rechazar todas</button>' +
          '<button type="button" class="cookie-btn" data-ck="accept">Aceptar todas</button>' +
          '<button type="button" class="cookie-btn" data-ck="config" aria-expanded="false" aria-controls="ck-panel">Configurar</button>' +
        '</div>' +
      '</div>' +
      '<form class="cookie-panel" id="ck-panel" hidden>' +
        '<div class="cookie-option">' +
          '<input type="checkbox" id="ck-tech" checked disabled>' +
          '<label for="ck-tech">Técnicas (necesarias)</label>' +
          '<p>Guardan tu elección sobre cookies. Siempre activas: no requieren consentimiento.</p>' +
        '</div>' +
        '<div class="cookie-option">' +
          '<input type="checkbox" id="ck-analytics" name="analytics">' +
          '<label for="ck-analytics">Analítica</label>' +
          '<p>Miden de forma agregada cómo se usa la web para mejorarla.</p>' +
        '</div>' +
        '<div class="cookie-option">' +
          '<input type="checkbox" id="ck-marketing" name="marketing">' +
          '<label for="ck-marketing">Marketing</label>' +
          '<p>Permiten mostrar publicidad y medir su eficacia en otros sitios.</p>' +
        '</div>' +
        '<div class="cookie-panel__actions">' +
          '<button type="submit" class="cookie-btn">Guardar selección</button>' +
        '</div>' +
      '</form>';
    el.querySelector("[data-policy]").href = policyUrl;   // la URL se asigna por DOM, no dentro del HTML
    document.body.appendChild(el);
    return el;
  }

  function setPanel(open) {
    var panel = banner.querySelector("#ck-panel");
    var btn = banner.querySelector('[data-ck="config"]');
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }

  function show(openPanel) {
    if (!banner) banner = build();
    var c = read();
    banner.querySelector("#ck-analytics").checked = !!(c && c.analytics);
    banner.querySelector("#ck-marketing").checked = !!(c && c.marketing);
    setPanel(!!openPanel);
    banner.classList.add("is-visible");
    if (openPanel) banner.querySelector("#ck-title").focus();
  }

  function hide() {
    if (banner) banner.classList.remove("is-visible");
  }

  // Guarda la elección; si se retira un consentimiento ya dado, recarga para
  // que los scripts de esa categoría dejen de ejecutarse.
  function decide(analytics, marketing) {
    var prev = read();
    var c = save(analytics, marketing);
    hide();
    var revoked = prev && ((prev.analytics && !c.analytics) || (prev.marketing && !c.marketing));
    if (revoked) { window.location.reload(); return; }
    activate(c);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-ck], [data-cookie-settings]");
    if (!t) return;

    if (t.hasAttribute("data-cookie-settings")) { e.preventDefault(); show(true); return; }

    var action = t.getAttribute("data-ck");
    if (action === "accept") decide(true, true);
    else if (action === "reject") decide(false, false);
    else if (action === "config") {
      setPanel(banner.querySelector("#ck-panel").hidden);
    }
  });

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "ck-panel") return;
    e.preventDefault();
    decide(e.target.analytics.checked, e.target.marketing.checked);
  });

  /* ---------- Arranque ---------- */
  var current = read();
  if (current) activate(current); // ya hay elección vigente
  else show(false);               // primera visita o consentimiento caducado
})();
