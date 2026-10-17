/* ==========================================================================
   ATLAS — Formulario de contacto
   Esta web es estática: no tiene servidor que reciba mensajes. Por eso el
   formulario NO envía nada por sí mismo: al pulsar el botón abre el programa
   de correo del visitante con el mensaje ya redactado, y lo envía él.
   Ventaja: no se guardan ni se transmiten datos en ningún servidor nuestro.

   Sin JavaScript el formulario no se muestra, y quedan visibles el correo y
   el teléfono de la columna izquierda.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var TO = form.getAttribute("data-to") || "";
  var MAX = 800;          // límite de caracteres del mensaje (los enlaces mailto no admiten textos largos)
  var status = document.getElementById("contact-status");
  var counter = document.getElementById("c-count");

  var fields = [
    { el: document.getElementById("c-name"),    err: document.getElementById("c-name-err"),    check: function (v) { return v.length >= 2 ? "" : "Escribe tu nombre."; } },
    { el: document.getElementById("c-topic"),   err: document.getElementById("c-topic-err"),   check: function (v) { return v ? "" : "Elige un motivo."; } },
    { el: document.getElementById("c-message"), err: document.getElementById("c-message-err"), check: function (v) { return v.length >= 10 ? "" : "Cuéntanos algo más (mínimo 10 caracteres)."; } }
  ];

  function value(f) { return (f.el.value || "").trim(); }

  function setError(f, msg) {
    if (msg) {
      f.err.textContent = msg;
      f.err.hidden = false;
      f.el.setAttribute("aria-invalid", "true");
    } else {
      f.err.textContent = "";
      f.err.hidden = true;
      f.el.removeAttribute("aria-invalid");
    }
  }

  // Valida todos los campos y devuelve el primero que falle (o null)
  function validate() {
    var first = null;
    fields.forEach(function (f) {
      var msg = f.check(value(f));
      setError(f, msg);
      if (msg && !first) first = f.el;
    });
    return first;
  }

  function updateCounter() {
    if (counter) counter.textContent = form.querySelector("#c-message").value.length + " / " + MAX;
  }

  // Al corregir un campo se quita su aviso
  fields.forEach(function (f) {
    f.el.addEventListener("input", function () { if (!f.check(value(f))) setError(f, ""); });
    f.el.addEventListener("change", function () { if (!f.check(value(f))) setError(f, ""); });
  });
  form.querySelector("#c-message").addEventListener("input", updateCounter);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";

    var invalid = validate();
    if (invalid) { invalid.focus(); return; }

    var name = value(fields[0]);
    var topic = value(fields[1]);
    var message = value(fields[2]).slice(0, MAX);

    var subject = "[Atlas web] " + topic;
    var body = "Hola, soy " + name + ".\n\n" + message;
    var href = "mailto:" + TO +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // Se abre el programa de correo mediante un enlace temporal
    var a = document.createElement("a");
    a.href = href;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Aviso por si el visitante no tiene programa de correo configurado
    status.textContent = "Se está abriendo tu programa de correo. Si no ocurre nada, escríbenos directamente a ";
    var link = document.createElement("a");
    link.href = "mailto:" + TO;
    link.textContent = TO;
    status.appendChild(link);
    status.appendChild(document.createTextNode("."));
  });

  updateCounter();
  form.hidden = false;      // con JavaScript se muestra el formulario
})();
