/* ==========================================================================
   ATLAS — Página de favoritos (favoritos.html)
   · Muestra las prendas guardadas con su precio actual y los avisos de cada una
     (precio rebajado, pocas unidades, agotada).
   · Formulario opcional para pedir los avisos también por correo.

   Los datos vienen de js/favorites.js (window.AtlasFavs); este archivo solo pinta la página.

   Avisos por correo: esta web es estática y no tiene servidor. Igual que la lista VIP (js/vip.js):
     · data-endpoint vacío (modo actual): al enviar se abre el programa de correo del visitante
       con la petición redactada y la lista de prendas.
     · data-endpoint con la URL de un proveedor de formularios o newsletter: se envía en segundo plano.
       Hay que añadir el dominio del proveedor a connect-src de la política de seguridad (meta CSP
       de favoritos.html y archivo _headers). Después, los avisos hay que enviarlos desde ese proveedor.
   ========================================================================== */
(function () {
  "use strict";

  var F = window.AtlasFavs;
  var listEl = document.getElementById("favs-list");
  if (!F || !listEl) return;

  var emptyEl = document.getElementById("favs-empty");
  var mailEl = document.getElementById("favs-mail");
  var titleEl = document.getElementById("favs-title");
  var form = document.getElementById("favs-mail-form");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function alertNode(it, alerts) {
    var box = el("div", "fav-card__alert");
    alerts.forEach(function (a) {
      var row = el("p");
      row.style.margin = "0";
      if (a.type === "price") {
        row.appendChild(el("strong", "", "Precio rebajado"));
        row.appendChild(document.createElement("br"));
        row.appendChild(document.createTextNode("Antes " + F.fmt(a.was) + " · Ahora " + F.fmt(a.now)));
      } else if (a.type === "low") {
        row.appendChild(el("strong", "", "Pocas unidades"));
        row.appendChild(document.createElement("br"));
        row.appendChild(document.createTextNode("Quedan pocas unidades de esta prenda."));
      } else {
        row.appendChild(el("strong", "", "Agotada"));
        row.appendChild(document.createElement("br"));
        row.appendChild(document.createTextNode("Ahora mismo no hay unidades disponibles."));
      }
      box.appendChild(row);
    });
    var ok = el("button", "fav-card__ok", "Entendido");
    ok.type = "button";
    ok.setAttribute("aria-label", "Entendido, avisos de " + it.name);
    ok.addEventListener("click", function () { F.acknowledge(it.id); });
    box.appendChild(ok);
    return box;
  }

  function card(it) {
    var href = F.root + it.id + ".html";
    var li = el("li", "fav-card");

    var media = el("a", "fav-card__media");
    media.href = href;
    media.setAttribute("aria-hidden", "true");
    media.tabIndex = -1;
    if (it.img) {
      var img = document.createElement("img");
      img.src = F.root + it.img;
      img.alt = "";
      img.loading = "lazy";
      media.appendChild(img);
    }
    li.appendChild(media);

    var body = el("div", "fav-card__body");
    var h = el("h3", "fav-card__name");
    var link = el("a", "", it.name);
    link.href = href;
    h.appendChild(link);
    body.appendChild(h);

    var price = el("p", "fav-card__price", F.fmt(it.now));
    if (it.now < it.ref) {
      var was = el("span", "fav-card__was", F.fmt(it.ref));
      price.appendChild(was);
    }
    body.appendChild(price);

    var alerts = F.alertsOf(it);
    if (alerts.length) body.appendChild(alertNode(it, alerts));

    var actions = el("div", "fav-card__actions");
    var see = el("a", "btn", "Elegir talla");
    see.href = href;
    var rm = el("button", "fav-card__remove", "Quitar");
    rm.type = "button";
    rm.setAttribute("aria-label", "Quitar de favoritos: " + it.name);
    rm.addEventListener("click", function () {
      F.remove(it.id);
      titleEl.focus();
    });
    actions.appendChild(see);
    actions.appendChild(rm);
    body.appendChild(actions);

    li.appendChild(body);
    return li;
  }

  function render() {
    var items = F.list();
    listEl.textContent = "";
    items.forEach(function (it) { listEl.appendChild(card(it)); });
    emptyEl.hidden = items.length > 0;
    listEl.hidden = items.length === 0;
    if (mailEl) mailEl.hidden = items.length === 0;
  }

  F.onChange(render);
  render();
  F.refresh(true);

  /* ---------- Avisos por correo ---------- */
  if (!form) return;

  var G = window.AtlasGuard;
  var guard = G ? G.attach(form, "favoritos") : null;
  var TO = (G && G.addr(form)) || form.getAttribute("data-to") || "";
  var ENDPOINT = form.getAttribute("data-endpoint") || "";
  var status = document.getElementById("favs-mail-status");
  var email = document.getElementById("favs-email");
  var emailErr = document.getElementById("favs-email-err");
  var consent = document.getElementById("favs-consent");
  var consentErr = document.getElementById("favs-consent-err");
  var submit = form.querySelector("button[type=\"submit\"]");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, box, msg) {
    box.textContent = msg;
    box.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }
  email.addEventListener("input", function () { if (EMAIL_RE.test(email.value.trim())) setError(email, emailErr, ""); });
  consent.addEventListener("change", function () { if (consent.checked) setError(consent, consentErr, ""); });

  function listText() {
    return F.list().map(function (it) { return "- " + it.name + " (" + F.fmt(it.now) + ")"; }).join("\n");
  }

  function sendByMail(address) {
    var body = "Quiero recibir avisos por correo si baja el precio o quedan pocas unidades de estas prendas de Atlas:\n" +
               listText() + "\n\nMi correo: " + address + "\n" +
               "Acepto recibir estos avisos por correo electrónico y he leído la política de privacidad.";
    var a = document.createElement("a");
    a.href = "mailto:" + TO + "?subject=" + encodeURIComponent("Avisos de mis favoritos · Atlas") + "&body=" + encodeURIComponent(body);
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    status.textContent = "Se está abriendo tu programa de correo: envía el mensaje para activar los avisos. Si no ocurre nada, escríbenos a ";
    var link = document.createElement("a");
    link.href = "mailto:" + TO;
    link.textContent = TO;
    status.appendChild(link);
    status.appendChild(document.createTextNode("."));
  }

  function sendToEndpoint(address) {
    var data = new FormData(form);
    data.set("email", address);
    data.set("tipo", "avisos-favoritos");
    data.set("favoritos", F.list().map(function (it) { return it.id; }).join(","));
    submit.disabled = true;
    status.textContent = "Enviando…";
    fetch(ENDPOINT, { method: "POST", body: data, headers: { "Accept": "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.textContent = "Listo. Te avisaremos por correo si cambia algo en tus favoritos.";
      })
      .catch(function () {
        status.textContent = "No hemos podido activar los avisos. Inténtalo de nuevo o escríbenos a " + TO + ".";
      })
      .then(function () { submit.disabled = false; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    var okEmail = EMAIL_RE.test(email.value.trim());
    setError(email, emailErr, okEmail ? "" : "Escribe un correo válido.");
    var okConsent = consent.checked;
    setError(consent, consentErr, okConsent ? "" : "Marca la casilla para poder avisarte.");
    if (!okEmail) { email.focus(); return; }
    if (!okConsent) { consent.focus(); return; }
    // Antispam: honeypot, tiempo mínimo y enfriamiento (js/guard.js)
    var g = guard ? guard.pass() : { ok: true };
    if (!g.ok) { status.textContent = g.silent ? "Hecho." : g.msg; return; }
    var address = G ? G.clean(email.value, 254) : email.value.trim();
    if (guard) guard.done();
    if (ENDPOINT) sendToEndpoint(address); else sendByMail(address);
  });

  form.hidden = false;       // con JavaScript se muestra el formulario
})();
