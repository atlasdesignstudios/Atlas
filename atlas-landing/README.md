# Atlas — web estática

HTML, CSS y JavaScript sin dependencias ni paso de compilación. Se abre con doble clic en `index.html` o se sube tal cual a cualquier alojamiento.

## Estructura
- `index.html`, `catalogo.html`, `nosotros.html`, `contacto.html`, `404.html`
- `legal/` — aviso legal, privacidad, cookies y condiciones de venta (con campos `[entre corchetes]` por completar)
- `css/` — `styles.css` (base, hero, cookies), `catalog.css`, `cart.css`, `pages.css` (Nosotros y Contacto), `legal.css`
- `js/` — `cart.js` (cesta), `cookies.js` (consentimiento), `catalog.js`, `contact.js`, `main.js` (menú), `disk-bridge.js` (solo al abrir desde el disco)
- `_headers`, `robots.txt`, `sitemap.xml`

## Cambiar un producto
En `catalogo.html`, cada prenda es un `<li class="card" data-product …>`. **El precio está en dos sitios y deben coincidir:** el atributo `data-price` (lo que cobra la cesta) y el texto de `card__price` (lo que ve el cliente).

## Activar el pago
En `js/cart.js`, `CONFIG.checkoutUrl` está vacío y el botón «Finalizar compra» queda desactivado. Cuando tengas pasarela de pago o tienda, pon ahí la dirección. Los precios deben validarse siempre en el servidor, nunca fiarse de la cesta del navegador.

## SEO: qué cambiar cuando tengas el dominio definitivo
1. Sustituye `https://www.atlasstudiobrand.com` por tu dominio en todos los `.html`, en `sitemap.xml` y en `robots.txt`.
2. Da de alta el sitio en Google Search Console y envía `sitemap.xml`.
3. Cuando actives el pago, añade datos estructurados `Product` con `offers` en el catálogo (hay una nota en el código).
4. Actualiza `lastmod` del sitemap al cambiar contenido.

## Publicar
- **Netlify / Cloudflare Pages:** arrastra la carpeta o conecta el repositorio de GitHub. `_headers` se aplica solo.
- **GitHub Pages:** sube la carpeta a un repositorio y activa Pages (Settings → Pages). No admite `_headers`; la política de seguridad ya va en cada página.
- Revisa siempre las condiciones de uso comercial del plan gratuito que elijas.

## Pendiente antes de publicar
- Completar los campos `[entre corchetes]` de `legal/` y quitar los avisos de borrador.
- Alojar las tipografías (Jost y Pirata One) en `assets/fonts/` en vez de cargarlas desde Google Fonts, por privacidad (RGPD).
- Confirmar que tienes derechos sobre las ilustraciones y fotografías de las prendas y del fondo.
