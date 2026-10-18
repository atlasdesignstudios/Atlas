/* ==========================================================================
   ATLAS — Lista VIP (nosotros.html)
   Esta web es estática: no tiene servidor que guarde correos. Por eso hay dos modos:

   1) data-endpoint vacío (modo actual): al enviar, se abre el programa de correo del
      visitante con el mensaje ya redactado y lo envía él (igual que el formulario de contacto).

   2) data-endpoint con la URL de un proveedor de formularios o newsletter (Buttondown,
      Brevo, Mailchimp, Formspree…): el correo se envía en segundo plano, sin salir de la página.
      Para activarlo hay que hacer tres cosas:
        a) Pegar la URL en data-endpoint del <form id="vip-form"> de nosotros.html.
        b) Añadir el dominio del proveedor a connect-src (y a form-action si hace falta) en la
           etiqueta <meta http-equiv="Content-Security-Policy"> de nosotros.html y en el archivo _headers;
           si no, el navegador bloquea el envío.
        c) Completar en legal/privacidad.html el proveedor de newsletter (hoy marcado con corchetes).

   Sin JavaScript el formulario no se muestra y queda visible el correo de contacto.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("vip-form");
  if (!form) return;

  var G = window.AtlasGuard;
  var guard = G ? G.attach(form, "vip") : null;
  var TO = (G && G.addr(form)) || form.getAttribute("data-to") || "";
  var ENDPOINT = form.getAttribute("data-endpoint") || "";
  var status = document.getElementById("vip-status");
  var email = document.getElementById("vip-email");
  var emailErr = document.getElementById("vip-email-err");
  var consent = document.getElementById("vip-consent");
  var consentErr = document.getElementById("vip-consent-err");
  var submit = form.querySelector("button[type=\"submit\"]");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, box, msg) {
    if (msg) {
      box.textContent = msg;
      box.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      box.textContent = "";
      box.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  function checkEmail() {
    var v = (email.value || "").trim();
    var msg = EMAIL_RE.test(v) ? "" : "Escribe un correo válido.";
    setError(email, emailErr, msg);
    return !msg;
  }

  function checkConsent() {
    var msg = consent.checked ? "" : "Marca la casilla para poder avisarte.";
    setError(consent, consentErr, msg);
    return !msg;
  }

  email.addEventListener("input", function () { if (EMAIL_RE.test(email.value.trim())) setError(email, emailErr, ""); });
  consent.addEventListener("change", function () { if (consent.checked) setError(consent, consentErr, ""); });

  function say(text) { status.textContent = text; }

  // Modo 1: abre el programa de correo con el mensaje redactado
  function sendByMail(address) {
    var subject = "Lista VIP Atlas · Drop I";
    var body = "Quiero entrar en la lista VIP de Atlas y recibir el aviso del Drop I.\n" +
               "Mi correo: " + address + "\n" +
               "Acepto recibir comunicaciones comerciales de Atlas por correo electrónico y he leído la política de privacidad.";
    var a = document.createElement("a");
    a.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    status.textContent = "Se está abriendo tu programa de correo: envía el mensaje para quedar en la lista. Si no ocurre nada, escríbenos a ";
    var link = document.createElement("a");
    link.href = "mailto:" + TO;
    link.textContent = TO;
    status.appendChild(link);
    status.appendChild(document.createTextNode("."));
  }

  // Modo 2: envío en segundo plano a un proveedor
  function sendToEndpoint(address) {
    var data = new FormData(form);
    data.set("email", address);
    submit.disabled = true;
    say("Enviando…");

    fetch(ENDPOINT, { method: "POST", body: data, headers: { "Accept": "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        say("Estás dentro. Te escribiremos cuando se abra la puerta.");
      })
      .catch(function () {
        say("No hemos podido apuntarte. Inténtalo de nuevo o escríbenos a " + TO + ".");
      })
      .then(function () { submit.disabled = false; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    say("");

    var okEmail = checkEmail();
    var okConsent = checkConsent();
    if (!okEmail) { email.focus(); return; }
    if (!okConsent) { consent.focus(); return; }

    // Antispam: honeypot, tiempo mínimo y enfriamiento (js/guard.js)
    var g = guard ? guard.pass() : { ok: true };
    if (!g.ok) { say(g.silent ? "Hecho." : g.msg); return; }

    var address = G ? G.clean(email.value, 254) : email.value.trim();
    if (guard) guard.done();
    if (ENDPOINT) sendToEndpoint(address);
    else sendByMail(address);
  });

  form.hidden = false;      // con JavaScript se muestra el formulario
})();
