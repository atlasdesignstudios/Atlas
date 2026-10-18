/* ==========================================================================
   ATLAS — Favoritos (se carga en todas las páginas, después de cart.js)
   · Corazón en cada prenda del catálogo y de las fichas: guarda o quita de favoritos.
   · Icono de favoritos en el header, con contador, junto a la cesta (la cesta no cambia).
   · Avisos: cuando el visitante vuelve a la web, compara el precio y el stock actuales
     con los de cuando guardó la prenda y avisa si ha bajado el precio o quedan pocas unidades.
   · Todo se guarda en el navegador (localStorage, clave atlas_favs) durante 12 meses.
     Es almacenamiento técnico que el visitante pide al pulsar el corazón: no guarda datos
     personales (ver Política de cookies).

   FUENTE DE VERDAD de precio y stock: catalogo.html. Esta web es estática y no puede enviar
   notificaciones por sí sola; por eso se consulta catalogo.html cuando el visitante navega.
     · Para bajar un precio: cambia data-price y card__price de la prenda en catalogo.html
       (y en su ficha, para que la cesta cobre lo mismo).
     · Para marcar pocas unidades: añade data-stock="low" al <li data-product> de catalogo.html.
       Para marcarla agotada: data-stock="out". Quita el atributo para volver a la normalidad.

   Lo comparte con favorites-page.js a través de window.AtlasFavs.
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "atlas_favs";
  var MAX_AGE_DAYS = 365;
  var MAX_ITEMS = 50;
  var CHECK_EVERY_MS = 10 * 60 * 1000;       // como mucho una consulta a catalogo.html cada 10 minutos
  var IMG_OK = /^assets\/img\/[\w.-]+\.(png|jpe?g|webp)$/i;
  var ID_OK = /^[\w-]{1,60}$/;

  var me = document.currentScript;
  var ROOT = new URL("../", me ? me.src : location.href).href;

  var money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  function fmt(n) { return money.format(n); }

  /* ---------- Almacenamiento ---------- */
  function clean(it) {
    if (!it || typeof it !== "object") return null;
    var id = String(it.id || "");
    var ref = Number(it.ref);
    var now = Number(it.now);
    if (!ID_OK.test(id) || !(ref >= 0)) return null;
    var img = String(it.img || "");
    var stock = it.stock === "low" || it.stock === "out" ? it.stock : "";
    var ack = it.ack === "low" || it.ack === "out" ? it.ack : "";
    return {
      id: id,
      name: String(it.name || "").slice(0, 120),
      img: IMG_OK.test(img) ? img : "",
      ref: ref,                               // precio de referencia: con el que se compara
      now: now >= 0 ? now : ref,              // último precio conocido
      stock: stock,                           // último estado de stock conocido
      ack: ack,                               // estado de stock que el visitante ya ha visto
      t: Number(it.t) > 0 ? Number(it.t) : 0  // cuándo se guardó (milisegundos)
    };
  }

  function parse(raw) {
    try {
      if (typeof raw !== "string" || raw.length > 40000) return null;
      var d = JSON.parse(raw);
      if (!d || d.v !== 1 || !Array.isArray(d.items) || typeof d.ts !== "number") return null;
      if (Date.now() - d.ts > MAX_AGE_DAYS * 86400000) return null;
      return d;
    } catch (e) { return null; }
  }

  function load() {
    var d = null;
    try { d = parse(window.localStorage.getItem(KEY)); } catch (e) { /* sin acceso */ }
    return d ? d.items.slice(0, MAX_ITEMS).map(clean).filter(Boolean) : [];
  }

  var items = load();

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), items: items })); } catch (e) { /* sin almacenamiento */ }
  }

  function find(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  /* ---------- Avisos de cada prenda ---------- */
  function alertsOf(it) {
    var list = [];
    if (it.now < it.ref) list.push({ type: "price", was: it.ref, now: it.now });
    if (it.stock && it.stock !== it.ack) list.push({ type: it.stock });
    return list;
  }
  function alertCount() {
    var n = 0;
    items.forEach(function (it) { if (alertsOf(it).length) n++; });
    return n;
  }

  /* ---------- Cambios ---------- */
  var listeners = [];
  function changed() {
    save();
    updateHeader();
    refreshButtons();
    listeners.forEach(function (fn) { try { fn(); } catch (e) { /* ignorar */ } });
  }

  function add(info) {
    if (!info || !ID_OK.test(info.id) || find(info.id) || items.length >= MAX_ITEMS) return false;
    var price = Number(info.price);
    items.push(clean({ id: info.id, name: info.name, img: info.img, ref: price, now: price, stock: info.stock || "", ack: info.stock || "", t: Date.now() }));
    changed();
    refresh(true);                           // ajusta enseguida precio y stock con los de catalogo.html
    return true;
  }
  function remove(id) {
    var before = items.length;
    items = items.filter(function (it) { return it.id !== id; });
    if (items.length !== before) changed();
  }
  // «Entendido»: el precio actual pasa a ser la referencia y el estado de stock se da por visto
  function acknowledge(id) {
    var it = find(id);
    if (!it) return;
    it.ref = it.now;
    it.ack = it.stock;
    changed();
  }

  /* ---------- Datos actuales desde catalogo.html ---------- */
  function readProducts(root) {
    var out = Object.create(null);
    Array.prototype.forEach.call(root.querySelectorAll("[data-product]"), function (el) {
      var id = el.getAttribute("data-id") || "";
      var price = parseFloat(el.getAttribute("data-price"));
      if (!ID_OK.test(id) || !(price >= 0)) return;
      var stock = el.getAttribute("data-stock");
      var img = el.querySelector('.card__img[data-view="front"]');
      out[id] = {
        id: id,
        name: el.getAttribute("data-name") || "",
        price: price,
        stock: stock === "low" || stock === "out" ? stock : "",
        img: img ? img.getAttribute("src") || "" : ""
      };
    });
    return out;
  }

  function applyCurrent(current) {
    var touched = false;
    items.forEach(function (it) {
      var c = current[it.id];
      if (!c) return;
      if (c.name && c.name !== it.name) { it.name = c.name.slice(0, 120); touched = true; }
      if (IMG_OK.test(c.img) && c.img !== it.img) { it.img = c.img; touched = true; }
      if (c.price !== it.now) { it.now = c.price; touched = true; }
      if (c.price > it.ref) { it.ref = c.price; touched = true; }       // si sube, la referencia sube; solo se avisa de bajadas
      if (c.stock !== it.stock) { it.stock = c.stock; touched = true; }
      if (!c.stock && it.ack) { it.ack = ""; touched = true; }          // vuelve la normalidad: se podrá avisar otra vez
      if (Date.now() - it.t < 60000 && it.ack !== c.stock) { it.ack = c.stock; touched = true; }   // recién guardada: no se avisa de lo que ya se veía
    });
    if (touched) changed();
  }

  // Consulta catalogo.html (misma web). Si no se puede (p. ej. abierta desde disco), se usan los últimos datos guardados.
  function refresh(force) {
    if (!items.length) return Promise.resolve();
    var last = 0;
    try { last = parseInt(window.sessionStorage.getItem("atlas_favs_checked") || "0", 10) || 0; } catch (e) { /* ignorar */ }
    if (!force && Date.now() - last < CHECK_EVERY_MS) return Promise.resolve();

    return fetch(ROOT + "catalogo.html", { cache: "no-cache" })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        try { window.sessionStorage.setItem("atlas_favs_checked", String(Date.now())); } catch (e) { /* ignorar */ }
        applyCurrent(readProducts(doc));
      })
      .catch(function () { /* sin conexión o desde disco: se mantienen los datos guardados */ });
  }

  /* ---------- Header: icono, contador y aviso ---------- */
  var linkEl, countEl, liveEl, toastEl;

  function svgHeart() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M12 20.8C7 17.2 3.5 14 3.5 9.9c0-2.4 1.8-4.1 4-4.1 1.7 0 3.4 1 4.5 2.6 1.1-1.6 2.8-2.6 4.5-2.6 2.2 0 4 1.7 4 4.1 0 4.1-3.5 7.3-8.5 10.9z");
    svg.appendChild(path);
    return svg;
  }

  function buildHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    linkEl = document.createElement("a");
    linkEl.className = "fav-link";
    linkEl.href = ROOT + "favoritos.html";
    linkEl.appendChild(svgHeart());
    linkEl.firstChild.setAttribute("fill", "none");
    linkEl.firstChild.setAttribute("stroke", "currentColor");
    linkEl.firstChild.setAttribute("stroke-width", "1.5");
    linkEl.firstChild.setAttribute("stroke-linejoin", "round");
    countEl = document.createElement("span");
    countEl.className = "fav-count";
    countEl.hidden = true;
    countEl.setAttribute("aria-hidden", "true");
    linkEl.appendChild(countEl);
    var cartBtn = header.querySelector(".cart-button");
    if (cartBtn) header.insertBefore(linkEl, cartBtn); else header.appendChild(linkEl);
    header.classList.add("has-favs");
    if (/favoritos\.html$/.test(location.pathname)) linkEl.setAttribute("aria-current", "page");
  }

  function updateHeader() {
    if (!linkEl) return;
    var n = items.length;
    var a = alertCount();
    countEl.textContent = String(n);
    countEl.hidden = n === 0;
    linkEl.classList.toggle("has-alert", a > 0);
    linkEl.setAttribute("aria-label", "Favorites" + (n ? ", " + n + (n === 1 ? " item" : " items") : "") + (a ? ", with updates" : ""));
  }

  function announce(text) {
    if (!liveEl) {
      liveEl = document.createElement("p");
      liveEl.className = "visually-hidden";
      liveEl.setAttribute("role", "status");
      document.body.appendChild(liveEl);
    }
    liveEl.textContent = "";
    window.setTimeout(function () { liveEl.textContent = text; }, 30);
  }

  /* ---------- Corazón en cada prenda ---------- */
  var buttons = [];

  function infoFrom(el) {
    var id = el.getAttribute("data-id") || "";
    var price = parseFloat(el.getAttribute("data-price"));
    var img = el.querySelector('.card__img[data-view="front"]');
    var src = img ? img.getAttribute("src") || "" : "";
    if (!ID_OK.test(id) || !(price >= 0)) return null;
    var stock = el.getAttribute("data-stock");
    return { id: id, name: el.getAttribute("data-name") || id, price: price, img: IMG_OK.test(src) ? src : "", stock: stock === "low" || stock === "out" ? stock : "" };
  }

  function paint(btn, info) {
    var on = !!find(info.id);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", (on ? "Remove from favorites: " : "Add to favorites: ") + info.name);
  }

  function refreshButtons() {
    buttons.forEach(function (b) { paint(b.btn, b.info); });
  }

  function buildButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-product]"), function (el) {
      var media = el.querySelector(".card__media");
      var info = infoFrom(el);
      if (!media || !info) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fav-btn";
      btn.appendChild(svgHeart());
      media.appendChild(btn);
      paint(btn, info);
      btn.addEventListener("click", function () {
        if (find(info.id)) {
          remove(info.id);
          announce("Removed from favorites: " + info.name);
        } else if (add(info)) {
          announce("Added to favorites: " + info.name + ". We'll let you know here if the price drops or few units are left.");
        } else {
          announce("You can't save more than " + MAX_ITEMS + " items in favorites.");
        }
      });
      buttons.push({ btn: btn, info: info });
    });
  }

  /* ---------- Aviso flotante al volver a la web ---------- */
  function describe(it) {
    var a = alertsOf(it);
    for (var i = 0; i < a.length; i++) {
      if (a[i].type === "price") return it.name + " ha bajado de precio: de " + fmt(a[i].was) + " a " + fmt(a[i].now) + ".";
    }
    for (var j = 0; j < a.length; j++) {
      if (a[j].type === "low") return "Quedan pocas unidades de " + it.name + ".";
      if (a[j].type === "out") return it.name + " se ha agotado.";
    }
    return "";
  }

  function maybeToast() {
    if (/favoritos\.html$/.test(location.pathname)) return;
    if (document.querySelector(".cookie-banner.is-visible")) return;      // no tapar el aviso de cookies
    var withAlerts = items.filter(function (it) { return alertsOf(it).length; });
    if (!withAlerts.length) return;

    var signature = withAlerts.map(function (it) { return it.id + ":" + it.now + ":" + it.stock; }).join("|");
    try {
      if (window.sessionStorage.getItem("atlas_favs_notice") === signature) return;   // ya avisado en esta visita
      window.sessionStorage.setItem("atlas_favs_notice", signature);
    } catch (e) { /* sin sessionStorage: se avisa cada vez */ }

    toastEl = document.createElement("div");
    toastEl.className = "fav-toast";
    toastEl.setAttribute("role", "status");
    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Novedades en tus favoritos. " + (withAlerts.length === 1 ? describe(withAlerts[0]) : "Hay cambios en " + withAlerts.length + " prendas.") + " "));
    var a = document.createElement("a");
    a.href = ROOT + "favoritos.html";
    a.textContent = "View favorites";
    p.appendChild(a);
    var close = document.createElement("button");
    close.type = "button";
    close.className = "fav-toast__close";
    close.textContent = "Close";
    close.addEventListener("click", function () { toastEl.hidden = true; });
    toastEl.appendChild(p);
    toastEl.appendChild(close);
    document.body.appendChild(toastEl);
  }

  /* ---------- Arranque ---------- */
  buildHeader();
  buildButtons();
  updateHeader();
  refreshButtons();

  window.AtlasFavs = {
    list: function () { return items.map(function (it) { return Object.assign({}, it); }); },
    alertsOf: alertsOf,
    remove: remove,
    acknowledge: acknowledge,
    refresh: refresh,
    onChange: function (fn) { listeners.push(fn); },
    root: ROOT,
    fmt: fmt
  };

  refresh(false).then(maybeToast);
})();
