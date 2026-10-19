/* ==========================================================================
   ATLAS — Protección de formularios (se carga antes de contact.js, vip.js y favorites-page.js)
   Capas contra spam y automatizaciones, sin molestar a personas reales (sin CAPTCHA visible):
     1. Honeypot: campo invisible que solo rellenan los bots. Si viene relleno, se descarta el
        envío y se responde como si hubiera ido bien (el bot no sabe que ha sido detectado).
     2. Tiempo mínimo: un envío a menos de 3 s de abrir la página no lo hace una persona.
     3. Enfriamiento: no se admiten dos envíos del mismo formulario en menos de 30 s.
     4. Limpieza de texto: se quitan caracteres de control y saltos de línea de los campos que
        van a una sola línea (asunto, nombre), para evitar inyección de cabeceras en el correo.
     5. La dirección de contacto no se escribe entera en el HTML (data-u + data-d): los bots que
        solo leen el código no la recogen.

   Límites: esto frena bots simples y envíos en masa desde el navegador, pero un atacante puede
   saltarse el JavaScript y enviar directamente al servicio al que apunte data-endpoint. Cuando
   conectes un servicio real, activa ahí también Cloudflare Turnstile y la limitación de
   velocidad (ver SEGURIDAD.md).
   ========================================================================== */
(function () {
  "use strict";

  var loadedAt = Date.now();
  var CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/g;

  // Texto limpio y con longitud máxima; si multiline es false, todo queda en una sola línea
  function clean(value, max, multiline) {
    var s = String(value == null ? "" : value).replace(/\r\n?/g, "\n").replace(CTRL, "");
    if (!multiline) s = s.replace(/\n+/g, " ");
    s = s.trim();
    return max ? s.slice(0, max) : s;
  }

  // Dirección de contacto a partir de data-u y data-d (o, si no existen, data-to)
  function addr(form) {
    var u = form.getAttribute("data-u"), d = form.getAttribute("data-d");
    var a = u && d ? u + "@" + d : (form.getAttribute("data-to") || "");
    return /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}$/.test(a) ? a : "";
  }

  function attach(form, name, minMs, cooldownMs) {
    minMs = minMs || 3000;
    cooldownMs = cooldownMs || 30000;
    var key = "atlas_guard_" + name;

    var trap = document.createElement("div");
    trap.setAttribute("aria-hidden", "true");
    trap.style.position = "absolute";
    trap.style.left = "-10000px";
    trap.style.width = "1px";
    trap.style.height = "1px";
    trap.style.overflow = "hidden";
    var input = document.createElement("input");
    input.type = "text";
    input.name = "atlas_hp";
    input.tabIndex = -1;
    input.autocomplete = "off";
    input.setAttribute("aria-hidden", "true");
    trap.appendChild(input);
    form.appendChild(trap);

    return {
      // Devuelve { ok: true } o { ok: false, silent: true } (bot) o { ok: false, msg: "…" }
      pass: function () {
        if (input.value) return { ok: false, silent: true };
        if (Date.now() - loadedAt < minMs) return { ok: false, msg: "Un momento… vuelve a intentarlo en unos segundos." };
        var last = 0;
        try { last = parseInt(window.sessionStorage.getItem(key) || "0", 10) || 0; } catch (e) { /* ignorar */ }
        var wait = cooldownMs - (Date.now() - last);
        if (wait > 0) return { ok: false, msg: "Ya has enviado esto hace un momento. Espera " + Math.ceil(wait / 1000) + " s." };
        return { ok: true };
      },
      done: function () {
        try { window.sessionStorage.setItem(key, String(Date.now())); } catch (e) { /* ignorar */ }
      }
    };
  }

  window.AtlasGuard = { clean: clean, addr: addr, attach: attach };
})();
