/* ==========================================================================
   ATLAS — Carrito
   · Botón «Añadir a la cesta» en cada prenda del catálogo (hace falta elegir talla).
   · Panel lateral con cantidades, quitar prendas y subtotal (IVA incluido).
   · La cesta se guarda en el navegador (localStorage) durante 30 días.
     Es almacenamiento técnico: no necesita consentimiento (ver Política de cookies).
   · El botón de pago está desactivado hasta que indiques una URL de pago
     (pasarela o tienda) en CONFIG.checkoutUrl.

   Cómo se enlaza con el HTML:
     <button data-cart-open>            abre el panel (en el header)
     <span data-cart-count>             contador de artículos
     <li data-product data-id data-name data-price>   prenda del catálogo
     <button data-add-to-cart>          añade la prenda con la talla elegida
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- CONFIGURACIÓN (lo único que tendrás que tocar) ---------- */
  var CONFIG = {
    // URL de pago, p. ej. "https://tu-tienda.com/checkout". Vacío = pago desactivado.
    checkoutUrl: "",
    // Dominios externos a los que se permite enviar al cliente a pagar (además de esta misma web).
    // P. ej. ["buy.stripe.com", "checkout.shopify.com"]. Solo se admiten direcciones https.
    checkoutHosts: [],
    storageKey: "atlas_cart",
    maxAgeDays: 30,        // la cesta caduca si no se toca en este tiempo
    maxPerLine: 10         // unidades máximas de una misma prenda y talla
  };
  var SIZES = ["S", "M", "L", "XL"];
  var IMG_OK = /^assets\/img\/[\w.-]+\.(png|jpe?g|webp)$/i;
  var ID_OK = /^[\w-]{1,60}$/;
  var CTRL = /[\u0000-\u001F\u007F\u2028\u2029]/g;
  var MAX_LINES = 20;        // líneas máximas en la cesta (evita cestas gigantes que bloqueen el navegador)
  var MAX_RAW = 20000;       // tamaño máximo (caracteres) de lo leído de localStorage
  var MAX_CENTS = 200000;    // precio máximo razonable por prenda (2.000 €)

  // Raíz del sitio, calculada respecto a este archivo (sirve desde cualquier carpeta)
  var me = document.currentScript;
  var ROOT = new URL("../", me ? me.src : location.href).href;

  var money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  function fmt(cents) { return money.format(cents / 100); }

  // Solo se acepta una URL de pago https de esta web o de un dominio de CONFIG.checkoutHosts
  function safeCheckoutUrl() {
    if (!CONFIG.checkoutUrl) return "";
    try {
      var u = new URL(CONFIG.checkoutUrl, window.location.href);
      if (u.protocol !== "https:") return "";
      if (u.hostname !== window.location.hostname && CONFIG.checkoutHosts.indexOf(u.hostname) < 0) return "";
      return u.href;
    } catch (e) { return ""; }
  }
  var CHECKOUT = safeCheckoutUrl();


  /* ---------- Estado y almacenamiento ---------- */
  var items = [];   // se rellena más abajo, cuando load() y sus constantes ya existen
  var drawer, overlay, listEl, emptyEl, footEl, totalEl, subtotalLabelEl, checkoutBtn, soonEl, closeBtn, countLabelEl;
  var lastFocus = null;

  function clean(it) {
    if (!it || typeof it !== "object") return null;
    var qty = parseInt(it.qty, 10);
    var cents = parseInt(it.cents, 10);
    var size = String(it.size || "");
    var id = String(it.id || "");
    if (!ID_OK.test(id) || !(qty >= 1) || !(cents >= 0) || cents > MAX_CENTS || SIZES.indexOf(size) < 0) return null;
    var img = String(it.img || "");
    return {
      id: id,
      name: String(it.name || "").replace(CTRL, "").slice(0, 120),
      size: size,
      cents: cents,
      qty: Math.min(qty, CONFIG.maxPerLine),
      img: IMG_OK.test(img) ? img : ""
    };
  }

  /* Copia de seguridad para cuando abres las páginas desde el disco (file://).
     Algunos navegadores (p. ej. Firefox o Safari) dan a cada archivo su propio
     almacenamiento, y entonces la cesta se perdería al cambiar de página.
     Solo en ese caso (protocolo file:) la cesta se copia también en window.name,
     que sobrevive a la navegación dentro de la misma pestaña.
     En un servidor real (https) no se usa. */
  var FROM_DISK = window.location.protocol === "file:";
  var NAME_PREFIX = "atlas_cart=";

  // Devuelve los datos guardados si son válidos y no han caducado
  function parse(raw) {
    try {
      if (typeof raw !== "string" || raw.length > MAX_RAW) return null;
      var d = JSON.parse(raw);
      if (!d || d.v !== 1 || !Array.isArray(d.items) || typeof d.ts !== "number") return null;
      if (Date.now() - d.ts > CONFIG.maxAgeDays * 86400000) return null;
      return d;
    } catch (e) { return null; }
  }

  // Lee localStorage y, si procede, la copia de window.name; gana la más reciente
  function readStored() {
    var best = null;
    try { best = parse(window.localStorage.getItem(CONFIG.storageKey)); } catch (e) { /* sin acceso */ }
    var name = String(window.name || "");
    if (FROM_DISK && name.indexOf(NAME_PREFIX) === 0) {
      var alt = parse(name.slice(NAME_PREFIX.length));
      if (alt && (!best || alt.ts > best.ts)) best = alt;
    }
    return best;
  }

  function load() {
    var d = readStored();
    return d ? d.items.slice(0, MAX_LINES).map(clean).filter(Boolean) : [];
  }

  function save() {
    var json = JSON.stringify({ v: 1, ts: Date.now(), items: items });
    try { window.localStorage.setItem(CONFIG.storageKey, json); } catch (e) { /* sin almacenamiento */ }
    // Solo se escribe en window.name si está vacío o ya contiene nuestra copia
    var name = String(window.name || "");
    if (FROM_DISK && (name === "" || name.indexOf(NAME_PREFIX) === 0)) {
      try { window.name = NAME_PREFIX + json; } catch (e) { /* ignorar */ }
    }
  }

  items = load();

  function find(id, size) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id && items[i].size === size) return items[i];
    }
    return null;
  }

  /* ---------- Verificación de precios ----------
     Lo guardado en localStorage lo puede editar cualquiera desde su navegador, así que nada de
     lo guardado se da por bueno: cada línea se compara con catalogo.html (la fuente de precios)
     y se corrige o se elimina. Importante: esto protege la interfaz, no el cobro. El importe
     real debe volver a calcularlo siempre la pasarela de pago o el servidor. */
  function verify() {
    if (FROM_DISK || !items.length) return Promise.resolve(false);
    return fetch(ROOT + "catalogo.html", { cache: "no-cache", credentials: "omit" })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var known = Object.create(null);
        Array.prototype.forEach.call(doc.querySelectorAll("[data-product]"), function (c) {
          var p = readProduct(c);
          if (ID_OK.test(p.id) && p.cents >= 0 && p.cents <= MAX_CENTS) known[p.id] = p;
        });
        var out = [], changed = false;
        items.forEach(function (it) {
          var k = known[it.id];
          if (!k) { changed = true; return; }          // prenda que ya no existe: se quita
          var name = k.name.replace(CTRL, "").slice(0, 120);
          if (it.cents !== k.cents || it.name !== name || it.img !== k.img) {
            it.cents = k.cents; it.name = name; it.img = k.img; changed = true;
          }
          out.push(it);
        });
        if (changed) { items = out; save(); render(); }
        return true;
      });
  }

  function totals() {
    var qty = 0, cents = 0;
    items.forEach(function (it) { qty += it.qty; cents += it.qty * it.cents; });
    return { qty: qty, cents: cents };
  }


  /* ---------- Acciones ---------- */
  function add(p, size) {
    var line = find(p.id, size);
    if (line) line.qty = Math.min(line.qty + 1, CONFIG.maxPerLine);
    else items.push({ id: p.id, name: p.name, size: size, cents: p.cents, qty: 1, img: p.img });
    save(); render();
  }

  function change(id, size, delta) {
    var line = find(id, size);
    if (!line) return;
    line.qty = Math.max(1, Math.min(line.qty + delta, CONFIG.maxPerLine));
    save(); render();
  }

  function remove(id, size) {
    items = items.filter(function (it) { return !(it.id === id && it.size === size); });
    save(); render();
  }


  /* ---------- Construcción del panel ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    overlay = el("div", "cart-overlay");
    overlay.setAttribute("data-cart-close", "");

    drawer = el("aside", "cart");
    drawer.id = "cart";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "cart-title");

    var head = el("div", "cart__head");
    var title = el("h2", "cart__title", "Tu cesta");
    title.id = "cart-title";
    countLabelEl = el("span", "cart__count");
    title.appendChild(countLabelEl);
    closeBtn = el("button", "cart__close");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Cerrar la cesta");
    closeBtn.setAttribute("data-cart-close", "");
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<path d="M5 5l14 14M19 5L5 19"/></svg>';
    head.appendChild(title);
    head.appendChild(closeBtn);

    var body = el("div", "cart__body");
    emptyEl = el("div", "cart__empty");
    emptyEl.appendChild(el("p", "", "Tu cesta está vacía."));
    var keep = el("button", "cart__keep", "Seguir comprando");
    keep.type = "button";
    keep.setAttribute("data-cart-close", "");
    emptyEl.appendChild(keep);
    listEl = el("ul", "cart__list");
    body.appendChild(emptyEl);
    body.appendChild(listEl);

    footEl = el("div", "cart__foot");
    var row = el("p", "cart__total");
    subtotalLabelEl = el("span", "", "Subtotal · IVA incluido");
    totalEl = el("strong", "");
    totalEl.setAttribute("aria-live", "polite");
    row.appendChild(subtotalLabelEl);
    row.appendChild(totalEl);
    var note = el("p", "cart__note", "Los gastos de envío se indican antes de confirmar el pedido.");
    checkoutBtn = el("button", "btn btn--block", "Finalizar compra");
    checkoutBtn.type = "button";
    checkoutBtn.setAttribute("data-cart-checkout", "");
    soonEl = el("p", "cart__note cart__soon", "El pago se activará cuando abramos la tienda. ");
    var notify = el("a", "", "Avísame cuando abra");
    notify.href = ROOT + "nosotros.html#lista-vip";
    soonEl.appendChild(notify);
    footEl.appendChild(row);
    footEl.appendChild(note);
    footEl.appendChild(checkoutBtn);
    footEl.appendChild(soonEl);

    drawer.appendChild(head);
    drawer.appendChild(body);
    drawer.appendChild(footEl);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  function itemNode(it) {
    var li = el("li", "cart-item");
    li.setAttribute("data-id", it.id);
    li.setAttribute("data-size", it.size);

    var media = el("div", "cart-item__media");
    if (it.img) {
      var img = el("img", "cart-item__img");
      img.src = ROOT + it.img;
      img.alt = "";
      media.appendChild(img);
    }

    var info = el("div", "cart-item__info");
    info.appendChild(el("p", "cart-item__name", it.name));
    info.appendChild(el("p", "cart-item__meta", "Talla " + it.size + " · " + fmt(it.cents)));

    var qty = el("div", "cart-item__qty");
    qty.setAttribute("role", "group");
    qty.setAttribute("aria-label", "Cantidad de " + it.name + ", talla " + it.size);
    var dec = el("button", "qty-btn", "−");
    dec.type = "button"; dec.setAttribute("data-action", "dec");
    dec.setAttribute("aria-label", "Una unidad menos");
    dec.disabled = it.qty <= 1;
    var num = el("span", "qty-num", String(it.qty));
    var inc = el("button", "qty-btn", "+");
    inc.type = "button"; inc.setAttribute("data-action", "inc");
    inc.setAttribute("aria-label", "Una unidad más");
    inc.disabled = it.qty >= CONFIG.maxPerLine;
    qty.appendChild(dec); qty.appendChild(num); qty.appendChild(inc);
    info.appendChild(qty);

    var side = el("div", "cart-item__side");
    var price = el("p", "cart-item__price", fmt(it.qty * it.cents));
    side.appendChild(price);
    var rm = el("button", "cart-item__remove", "Quitar");
    rm.type = "button"; rm.setAttribute("data-action", "remove");
    rm.setAttribute("aria-label", "Quitar " + it.name + ", talla " + it.size);
    side.appendChild(rm);

    li.appendChild(media); li.appendChild(info); li.appendChild(side);
    li._refs = { num: num, dec: dec, inc: inc, price: price };
    return li;
  }

  // Actualiza una línea existente sin recrearla (así la miniatura no parpadea)
  function updateNode(li, it) {
    var r = li._refs;
    r.num.textContent = String(it.qty);
    r.dec.disabled = it.qty <= 1;
    r.inc.disabled = it.qty >= CONFIG.maxPerLine;
    r.price.textContent = fmt(it.qty * it.cents);
  }


  /* ---------- Pintado ---------- */
  function render() {
    var t = totals();

    // Contador del header
    Array.prototype.forEach.call(document.querySelectorAll("[data-cart-count]"), function (n) {
      n.textContent = t.qty > 99 ? "99+" : String(t.qty);
      n.hidden = t.qty === 0;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cart-open]"), function (b) {
      b.setAttribute("aria-label", t.qty === 0 ? "Abrir la cesta (vacía)" :
        "Abrir la cesta (" + t.qty + (t.qty === 1 ? " artículo)" : " artículos)"));
    });

    // Panel
    countLabelEl.textContent = t.qty ? " (" + t.qty + ")" : "";
    var existing = {};
    Array.prototype.forEach.call(listEl.children, function (li) {
      existing[li.getAttribute("data-id") + "|" + li.getAttribute("data-size")] = li;
    });
    items.forEach(function (it, i) {
      var key = it.id + "|" + it.size;
      var li = existing[key];
      if (li) { updateNode(li, it); delete existing[key]; }
      else li = itemNode(it);
      if (listEl.children[i] !== li) listEl.insertBefore(li, listEl.children[i] || null);
    });
    Object.keys(existing).forEach(function (k) { listEl.removeChild(existing[k]); });
    emptyEl.hidden = t.qty > 0;
    listEl.hidden = t.qty === 0;
    footEl.hidden = t.qty === 0;
    totalEl.textContent = fmt(t.cents);
    checkoutBtn.disabled = !CHECKOUT;
    soonEl.hidden = !!CHECKOUT;
  }


  /* ---------- Abrir / cerrar ---------- */
  function setInert(on) {
    Array.prototype.forEach.call(document.body.children, function (n) {
      if (n === drawer || n === overlay) return;
      if (on) {
        if (!n.inert) { n.inert = true; n.setAttribute("data-cart-inert", ""); }
      } else if (n.hasAttribute("data-cart-inert")) {
        n.inert = false; n.removeAttribute("data-cart-inert");
      }
    });
  }

  function isOpen() { return drawer.classList.contains("is-open"); }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    document.documentElement.classList.add("cart-open");
    setInert(true);
    closeBtn.focus();
  }

  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.documentElement.classList.remove("cart-open");
    setInert(false);
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus();
  }


  /* ---------- Eventos ---------- */
  function readProduct(card) {
    var cents = Math.round(parseFloat(card.getAttribute("data-price")) * 100);
    var img = card.querySelector('.card__img[data-view="front"]');
    var src = img ? img.getAttribute("src") : "";
    return {
      id: card.getAttribute("data-id") || "",
      name: card.getAttribute("data-name") || "",
      cents: cents,
      img: IMG_OK.test(src || "") ? src : ""
    };
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    if (t.closest("[data-cart-open]")) { open(); return; }
    if (t.closest("[data-cart-close]")) { close(); return; }

    if (t.closest("[data-cart-checkout]")) {
      if (CHECKOUT) {
        // Antes de pagar se vuelven a comprobar los precios con el catálogo
        checkoutBtn.disabled = true;
        verify().then(function (ok) {
          checkoutBtn.disabled = false;
          if (ok && items.length) window.location.href = CHECKOUT;
        }).catch(function () {
          checkoutBtn.disabled = false;
          soonEl.hidden = false;
          soonEl.textContent = "No hemos podido verificar los precios. Inténtalo de nuevo en un momento.";
        });
      }
      return;
    }

    // Botones dentro del panel: − / + / Quitar
    var act = t.closest("[data-action]");
    if (act && drawer.contains(act)) {
      var li = act.closest(".cart-item");
      var id = li.getAttribute("data-id"), size = li.getAttribute("data-size");
      var action = act.getAttribute("data-action");
      var idx = Array.prototype.indexOf.call(listEl.children, li);
      if (action === "remove") {
        remove(id, size);
        var rms = listEl.querySelectorAll('[data-action="remove"]');
        (rms[Math.min(idx, rms.length - 1)] || closeBtn).focus();
      } else {
        change(id, size, action === "inc" ? 1 : -1);
        var again = listEl.querySelector('[data-id="' + id + '"][data-size="' + size + '"] [data-action="' + action + '"]');
        // si el botón quedó desactivado (mínimo o máximo), el foco pasa al contrario
        if (again && again.disabled) again = listEl.querySelector('[data-id="' + id + '"][data-size="' + size + '"] [data-action="' + (action === "inc" ? "dec" : "inc") + '"]');
        if (again) again.focus();
      }
      return;
    }

    // «Añadir a la cesta» en una tarjeta del catálogo
    var addBtn = t.closest("[data-add-to-cart]");
    if (addBtn) {
      var card = addBtn.closest("[data-product]");
      if (!card) return;
      var chosen = card.querySelector('input[type="radio"]:checked');
      var err = card.querySelector(".card__error");
      if (!chosen) {
        if (err) err.hidden = false;
        var first = card.querySelector('input[type="radio"]');
        if (first) first.focus();
        return;
      }
      if (err) err.hidden = true;
      var p = readProduct(card);
      if (!p.id || !p.name || !(p.cents >= 0)) return;
      add(p, chosen.value);
      open();
    }
  });

  // Al elegir talla se quita el aviso de error
  document.addEventListener("change", function (e) {
    if (!e.target.matches || !e.target.matches('.sizes input[type="radio"]')) return;
    var card = e.target.closest("[data-product]");
    var err = card && card.querySelector(".card__error");
    if (err) err.hidden = true;
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close();
  });

  // Si cambia la cesta en otra pestaña, se actualiza aquí
  window.addEventListener("storage", function (e) {
    if (e.key === CONFIG.storageKey) { items = load(); render(); }
  });

  // Al volver con «Atrás» el navegador puede mostrar la página tal y como estaba
  // (sin recargarla): se relee la cesta por si ha cambiado mientras tanto
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { items = load(); render(); }
  });


  /* ---------- Arranque ---------- */
  build();
  render();
  verify().catch(function () { /* sin conexión: se vuelve a comprobar al pagar */ });

  // Con JavaScript: se muestran el botón de la cesta y los selectores de talla
  Array.prototype.forEach.call(document.querySelectorAll("[data-cart-open], .card__buy"), function (n) { n.hidden = false; });
  Array.prototype.forEach.call(document.querySelectorAll(".card__sizes"), function (n) { n.hidden = true; });
})();
