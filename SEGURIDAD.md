# Atlas · Guía de seguridad (hardening)

Última revisión: 18 de octubre de 2026. Los límites de Cloudflare cambian con el tiempo: compruébalos en su panel.

## 0. Lo primero: qué se puede y qué no se puede proteger

Atlas es una web estática. Eso es una ventaja enorme: no hay servidor propio, ni base de datos, ni
contraseñas que robar. Pero marca los límites:

| Amenaza | ¿Qué la frena? | Dónde se configura |
|---|---|---|
| XSS / inyección de código | CSP estricta + código que nunca usa `innerHTML` con datos externos | Ya hecho en el código |
| Clickjacking (iframes ajenos) | `X-Frame-Options` y `frame-ancestors` | **Solo con cabeceras HTTP** (ver 1) |
| DDoS capas 3/4 y 7 | La red de Cloudflare | Cloudflare (ver 3) |
| Scraping y bots | Reglas WAF + Bot Fight Mode | Cloudflare (ver 3) |
| Spam en formularios | Honeypot + tiempo mínimo + enfriamiento (hecho) y Turnstile + servidor (pendiente) | Código y proveedor de formularios (ver 4) |
| Manipulación de precios en la cesta | Verificación contra el catálogo (hecho) **y** recálculo en el pago (pendiente) | Pasarela de pago |

Dos verdades incómodas:

1. **`<meta>` no sustituye a las cabeceras.** Las etiquetas `<meta http-equiv="Content-Security-Policy">`
   no admiten `frame-ancestors`, y `X-Frame-Options`, HSTS o `Permissions-Policy` no funcionan en `<meta>`.
   GitHub Pages no deja poner cabeceras. Para tenerlas hay que poner Cloudflare delante (ver 1.2) o alojar
   la web en Cloudflare Pages o Netlify, que leen el archivo `_headers`.
2. **Cualquier cosa que ocurra en el navegador la puede cambiar el visitante.** Eso incluye el precio de
   la cesta. El cobro real debe recalcular siempre el importe en la pasarela de pago (ver 2.3).

---

## 1. CSP y cabeceras HTTP

### 1.1 Qué se ha aplicado

- **Las 15 páginas** llevan la misma CSP en `<meta>`, ahora más estricta (`default-src 'none'`, `base-uri 'none'`, `manifest-src 'self'`).
- **`_headers`** tiene la versión completa, con las cabeceras que el `<meta>` no puede llevar.
- El `<meta>` y `_headers` dicen lo mismo, salvo `frame-ancestors` y `upgrade-insecure-requests`, que solo valen como cabecera.

CSP en cabecera:

```
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

Qué significa cada decisión:

- `default-src 'none'`: lo que no se permita expresamente, se bloquea.
- `script-src 'self'`: solo se ejecutan scripts de tu propia web. Sin `'unsafe-inline'` ni `'unsafe-eval'`: un XSS no podría ejecutar nada. Los bloques `application/ld+json` (SEO) no son código y no se ven afectados.
- `style-src 'self' https://fonts.googleapis.com` y `font-src https://fonts.gstatic.com`: lo mínimo para Google Fonts. No hay estilos en línea en el HTML.
- `img-src 'self' data:`: `data:` es necesario solo para el grano del lookbook (SVG en el CSS).
- `connect-src 'self'`: el JavaScript solo puede hablar con tu web. **Si conectas un proveedor de newsletter, de formularios o de pago, hay que añadir su dominio aquí.**
- `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'`: ni formularios hacia fuera, ni iframes ajenos, ni plugins.

Mejora recomendada: **alojar tú las tipografías** (Jost y Pirata One) en `assets/fonts/` y quitar Google Fonts de la CSP. Así desaparece el único recurso de terceros: la CSP queda en `'self'` para todo, no se envía la IP de los visitantes a Google (un asunto de RGPD) y la web carga más rápido. No pude descargarlas desde aquí porque este entorno no tiene acceso a internet.

Otras cabeceras de `_headers`:

| Cabecera | Valor | Para qué |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | El navegador no adivina tipos de archivo (anti MIME sniffing) |
| `X-Frame-Options` | `DENY` | Nadie puede meter tu web en un iframe (anti clickjacking, para navegadores antiguos) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | A otras webs solo se les envía el dominio, nunca la ruta ni parámetros |
| `Permissions-Policy` | todo desactivado (cámara, micro, geolocalización, pago, USB…) | Una pieza de código inyectada no podría pedirlos |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | El navegador solo usa HTTPS durante 1 año |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla tu pestaña de ventanas de otros sitios |
| `Cross-Origin-Resource-Policy` | `same-origin` | Otras webs no pueden incrustar tus imágenes o scripts (anti hotlinking) |
| `X-Permitted-Cross-Domain-Policies` | `none` | Bloquea políticas de Flash/PDF antiguas |

**HSTS con `preload`:** no lo añadas todavía. Entrar en la lista de precarga es casi irreversible y
`includeSubDomains` afecta a *todos* los subdominios. Cuando confirmes que todos funcionan con HTTPS, cambia a
`max-age=63072000; includeSubDomains; preload` y solicita la inclusión en hstspreload.org.

### 1.2 Cómo poner las cabeceras según dónde esté la web

**A) Cloudflare Pages o Netlify:** nada que hacer. Leen `_headers` al subir la carpeta.

**B) GitHub Pages con Cloudflare delante** (tu caso actual): en Cloudflare, **Rules → Transform Rules → Modify
Response Header → Create rule**.

1. Nombre: `Cabeceras de seguridad Atlas`.
2. Condición: **All incoming requests** (o `Hostname equals www.atlasstudiobrand.com`).
3. En **Modify response headers**, añade con **Set static** cada pareja de la tabla anterior, y la CSP completa de arriba.
4. Guarda y despliega. Comprueba con `curl -I https://www.atlasstudiobrand.com/` (ver 5).

> Con la URL `atlasdesignstudios.github.io/Atlas/`, las cabeceras **no** se aplican, porque ese dominio no pasa por Cloudflare. Solo se protege el dominio propio.

---

## 2. Código JavaScript

### 2.1 Lo que ya estaba bien

El panel de la cesta, las tarjetas de favoritos y los avisos se construyen con `createElement` y `textContent`, no con
`innerHTML`. Un nombre de producto como `<img src=x onerror=alert(1)>` se muestra como texto, no se ejecuta. El único `innerHTML`
que quedaba con datos dinámicos era el del aviso de cookies (la URL de la política), y ya se asigna por DOM.

### 2.2 Lo que se ha endurecido

`js/cart.js`:

- **Identificadores validados** (`^[\w-]{1,60}$`): bloquea ids con comillas que rompían los selectores y dejaban la cesta inutilizable.
- **Límites contra agotar el navegador**: máximo 20 líneas, 20.000 caracteres leídos de `localStorage` y precio máximo de 2.000 € por prenda. Se recorta *antes* de procesar, para que una cesta gigante no bloquee la pestaña.
- **Texto limpio**: se eliminan caracteres de control de los nombres.
- **Verificación de precios** (`verify()`): al abrir cualquier página y antes de pagar, cada línea se compara con `catalogo.html`. Si el precio no coincide se corrige; si la prenda no existe se elimina.
- **URL de pago validada**: solo `https`, y solo de tu dominio o de los que pongas en `CONFIG.checkoutHosts`. Una URL `javascript:` o de otro dominio no activa el botón.
- Se usa `Object.create(null)` para los catálogos (un id llamado `__proto__` no puede alterar el objeto).

`js/favorites.js`: mismos límites, y se recorta antes de procesar.

`js/cookies.js`: sin cadenas de texto con datos dentro de `innerHTML`.

Para probarlo, el carrito se ha verificado con 21 pruebas automáticas (ids con comillas, precios negativos, JSON gigante, `javascript:` en imagen y en URL de pago, etc.).

### 2.3 Manipulación de precios: la regla de oro

`localStorage` lo puede editar cualquiera desde las herramientas del navegador. `verify()` evita que la *interfaz* muestre precios falsos,
pero **no protege el cobro**. Cuando actives pagos:

- Usa una pasarela que fije el precio en su servidor (por ejemplo, enlaces de pago de Stripe con el precio ya definido para cada producto, o Shopify/Lemon Squeezy).
- Envía al pago solo *id + talla + cantidad*, nunca el importe, y que sea la pasarela quien calcule el total.
- Añade el dominio de pago a `CONFIG.checkoutHosts` en `cart.js` y a `connect-src`/`form-action` en la CSP si hace falta.

---

## 3. Cloudflare (plan gratuito) paso a paso

El plan gratuito incluye protección DDoS ilimitada y sin coste, 5 reglas WAF personalizadas y 1 regla de límite de velocidad
(ventana de 10 s, por IP). Es suficiente para esta web.

### 3.1 Poner la web detrás de Cloudflare

1. Crea cuenta en cloudflare.com → **Add a domain** → `atlasstudiobrand.com` → plan **Free**.
2. En tu registrador, cambia los *nameservers* a los que te indique Cloudflare. Espera a que el dominio figure como *Active*.
3. En **DNS → Records**, para GitHub Pages:
   - 4 registros `A` en `@` apuntando a `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`.
   - 1 registro `CNAME` en `www` apuntando a `atlasdesignstudios.github.io`.
   - **Déjalos en gris (DNS only) al principio.**
4. En GitHub: **Settings → Pages → Custom domain** = `www.atlasstudiobrand.com`. Espera a que GitHub emita el certificado y marca **Enforce HTTPS**.
5. Cuando funcione, **activa la nube naranja (Proxied)** en esos registros.
6. **SSL/TLS → Overview**: modo **Full (strict)**. **SSL/TLS → Edge Certificates**: activa *Always Use HTTPS*, *Automatic HTTPS Rewrites* y *Minimum TLS Version 1.2*.
7. **Rules → Redirect Rules**: redirige `atlasstudiobrand.com/*` a `https://www.atlasstudiobrand.com/${1}` (301), para tener una sola dirección.

### 3.2 Protección DDoS

Está activa desde el momento en que el dominio es naranja: la capa 3/4 y la capa 7 se mitigan automáticamente, sin configurar nada.
Revisa en **Security → Events** qué se bloquea.

### 3.3 Bots y scrapers

1. **Security → Bots → Bot Fight Mode**: *On*.
2. En esa misma pantalla, activa el bloqueo de rastreadores de IA si aparece (*Block AI bots / AI Scrapers and Crawlers*).
3. **Scrape Shield** (o **Security → Settings**): activa *Email Address Obfuscation* (oculta tu correo a los bots que leen el HTML) y *Hotlink Protection* (nadie puede usar tus imágenes en su web).

### 3.4 Reglas WAF personalizadas (las 5 del plan gratuito)

En **Security → WAF → Custom rules** (según la versión del panel, **Security rules**). Pega cada expresión con *Edit expression*.

**Regla 1. Bloquear rutas de escáneres** (acción: *Block*). Tu web es estática y no tiene nada de esto.

```
(http.request.uri.path contains "/wp-admin") or (http.request.uri.path contains "wp-login") or (http.request.uri.path contains "xmlrpc") or (http.request.uri.path contains "/.env") or (http.request.uri.path contains "/.git") or (http.request.uri.path contains "phpmyadmin") or (http.request.uri.path contains "/cgi-bin")
```

**Regla 2. Solo lectura** (acción: *Block*). Una web estática solo necesita GET y HEAD; esto corta inundaciones de POST.

```
(not http.request.method in {"GET" "HEAD" "OPTIONS"})
```

**Regla 3. Herramientas de scraping** (acción: *Managed Challenge*; con *Block* te bloquearías a ti al probar con `curl`).

```
(http.user_agent eq "") or (lower(http.user_agent) contains "python-requests") or (lower(http.user_agent) contains "scrapy") or (lower(http.user_agent) contains "go-http-client") or (lower(http.user_agent) contains "wget") or (lower(http.user_agent) contains "httpclient") or (lower(http.user_agent) contains "libwww") or (lower(http.user_agent) contains "sqlmap") or (lower(http.user_agent) contains "nikto")
```

El `User-Agent` se puede falsificar, así que esto frena a los bots simples; Bot Fight Mode se encarga del resto.

**Regla 4. Parámetros sospechosos** (acción: *Block*). La web no usa parámetros en la URL.

```
(len(http.request.uri.query) gt 512) or (lower(http.request.uri.query) contains "<script") or (lower(http.request.uri.query) contains "union select") or (http.request.uri.query contains "../")
```

**Regla 5. Modo emergencia** (acción: *Managed Challenge*; **créala desactivada**). Actívala solo si sufres un ataque.

```
(http.host eq "www.atlasstudiobrand.com") or (http.host eq "atlasstudiobrand.com")
```

### 3.5 Límite de velocidad (1 regla gratuita)

**Security → WAF → Rate limiting rules → Create rule**:

- Nombre: `Límite general Atlas`.
- Expresión: `(http.host eq "www.atlasstudiobrand.com")`
- Característica de recuento: **IP**.
- Peticiones: **150** cada **10 segundos** (una página carga unas 30 peticiones, así que un visitante real no se acerca).
- Acción: **Block**, duración **10 segundos** (el máximo del plan gratuito).

Ajusta el número mirando *Security → Events* tras unos días.

El formulario de contacto y la lista VIP **no envían nada a tu servidor** (abren el correo del visitante o van a un proveedor externo),
así que esta regla no los protege: el límite de velocidad de esos envíos se configura en el proveedor (ver 4).

### 3.6 «Under Attack Mode»

Solo cuando haya un ataque en curso: **Security → Settings → Security Level → I'm Under Attack** (o, desde *Overview*, *Quick actions*).
Muestra un desafío de 5 segundos a cada visitante. Es molesto para clientes reales: **desactívalo al terminar** (vuelve a *Medium*). Para casos
menos graves, usa la regla 5 en lugar de este modo.

### 3.7 Un punto débil: el origen sigue accesible

Con GitHub Pages, `atlasdesignstudios.github.io/Atlas/` sigue respondiendo directamente y **se salta Cloudflare**. Un atacante puede apuntar ahí.
La solución definitiva es alojar la web en **Cloudflare Pages**: todo el tráfico pasa por Cloudflare, `_headers` funciona sin Transform Rules y los
despliegues se hacen desde el mismo repositorio de GitHub.

---

## 4. Formularios y datos

### 4.1 Ya implementado (`js/guard.js`)

En el formulario de contacto, la lista VIP y los avisos de favoritos:

- **Honeypot** invisible (`atlas_hp`): un bot que lo rellene recibe un «éxito» falso y no se envía nada.
- **Tiempo mínimo** de 3 s desde que se abre la página.
- **Enfriamiento** de 30 s entre envíos del mismo formulario.
- **Limpieza**: sin saltos de línea ni caracteres de control en asunto y nombre (evita inyectar cabeceras como `Bcc:`), y límites de longitud.
- La dirección de contacto de los formularios ya **no aparece entera en el HTML** (`data-u` + `data-d`).

Esto frena bots simples. Un atacante que se salte el JavaScript y envíe directo al servicio que conectes no se ve frenado: eso lo para Turnstile con verificación en servidor.

### 4.2 Cloudflare Turnstile (cuando conectes un servicio real)

Hoy los formularios abren el correo del visitante y no hay nada que verificar. El día que conectes un proveedor (`data-endpoint`):

1. En Cloudflare: **Turnstile → Add widget** → dominio `www.atlasstudiobrand.com`, modo *Managed*. Copia la *Site key* (pública) y guarda la *Secret key* (secreta, solo en el servidor).
2. Añade este HTML dentro del `<form>`, antes del botón:

```html
<div class="cf-turnstile" data-sitekey="TU_SITE_KEY" data-theme="dark" data-language="es"></div>
```

y este script en el mismo HTML (antes de `</body>`):

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

3. Amplía la CSP (en el `<meta>` de esas páginas y en `_headers`) con exactamente esto:

```
script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com
```

(Y añade además el dominio del proveedor a `connect-src`.)

4. **Lo importante:** el token que genera Turnstile (`cf-turnstile-response`, se añade solo al formulario) **debe verificarse en un servidor**
   con la Secret key. En JavaScript del navegador no sirve de nada. Opciones: un proveedor que lo verifique por ti, o un *Cloudflare Worker* propio
   (gratuito) que haga esto y reenvíe al proveedor:

```js
export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Método no permitido", { status: 405 });
    const form = await request.formData();
    if (form.get("atlas_hp")) return new Response("ok");                       // honeypot
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: form.get("cf-turnstile-response") || "" })
    }).then(r => r.json());
    if (!check.success) return new Response("Verificación fallida", { status: 403 });
    // Aquí reenvías el correo a tu proveedor de newsletter (con su clave guardada en env.PROVIDER_KEY)
    return new Response("ok");
  }
};
```

Es una plantilla: falta la llamada concreta a tu proveedor. Además, en el Worker puedes añadir tu propio límite por IP.

### 4.3 Privacidad y datos en el código fuente

- **Nunca** pongas en el código: claves secretas, tokens de API, contraseñas ni la *Secret key* de Turnstile. Todo lo que está en el repositorio o en el navegador es público. Las claves *públicas* (Site key de Turnstile, ID de analítica) sí pueden estar.
- El correo de contacto sigue visible en el pie y en las páginas legales: es un requisito legal (LSSI, art. 10). Para que no lo recojan los bots, activa *Email Address Obfuscation* de Cloudflare (3.3).
- Tu correo es `atlasdesigntudios@gmail.com`: comprueba que no es una errata de `atlasdesignstudios`.
- Si usas un proveedor de newsletter, complétalo en `legal/privacidad.html` (hoy hay campos entre corchetes), con base legal (consentimiento), conservación y cómo darse de baja.
- Activa en GitHub: **Settings → Code security** → *Secret scanning* y *Dependabot alerts*, y la verificación en dos pasos en tu cuenta de GitHub y en Cloudflare. Quien controle esas cuentas controla la web.

---

## 5. Cómo comprobar que todo funciona

1. **Cabeceras:** `curl -I https://www.atlasstudiobrand.com/` debe mostrar `content-security-policy`, `strict-transport-security`, `x-frame-options`, etc.
2. **Nota global:** securityheaders.com y developer.mozilla.org/es/observatory (objetivo: A o A+).
3. **CSP:** abre la web con la consola del navegador. No deben aparecer errores en rojo «Refused to load…». Si aparece alguno, es que falta permitir un dominio.
4. **Clickjacking:** crea un HTML local con `<iframe src="https://www.atlasstudiobrand.com/">`. Debe verse vacío.
5. **Formularios:** rellena el campo invisible `atlas_hp` desde la consola y envía: no debe enviarse nada.
6. **Cesta manipulada:** en la consola, `localStorage.setItem("atlas_cart", ...)` con un precio de 1 céntimo y recarga: debe corregirse al precio del catálogo (solo desde un servidor https, no desde el disco).

## 6. Mantenimiento

- Cada vez que añadas un servicio externo (pago, newsletter, analítica, vídeo), actualiza la CSP en **las 15 páginas y en `_headers`**.
- Si añades una prenda, comprueba que su `data-id` solo lleva letras, números, `-` o `_`: si no, la cesta la rechazará.
- Revisa **Security → Events** en Cloudflare una vez al mes.
- Renueva `.well-known/security.txt` antes de su fecha de expiración (18 de octubre de 2027).
