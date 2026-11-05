# Lusius — web estática

HTML, CSS y JavaScript sin dependencias ni paso de compilación. Se abre con doble clic en `index.html` o se sube tal cual a cualquier alojamiento.

## Estructura
- `index.html`, `catalogo.html`, `nosotros.html`, `contacto.html`, `favoritos.html`, `404.html`
- Una página por prenda: `hoodie-zip-choices.html`, `sueter-jacquard.html`, `camiseta-spiral.html`, `manga-larga-third-eye.html`, `manga-larga-the-cycle.html`
- `legal/` — aviso legal, privacidad, cookies y condiciones de venta (con campos `[entre corchetes]` por completar)
- `css/` — `styles.css` (base, hero, cookies), `catalog.css`, `cart.css`, `pages.css` (Nosotros y Contacto), `product.css`, `lookbook.css`, `favorites.css`, `legal.css`
- `js/` — `cart.js` (cesta), `cookies.js` (consentimiento), `catalog.js`, `contact.js`, `main.js` (menú), `favorites.js` y `favorites-page.js` (favoritos), `guard.js` (antispam), `vip.js`, `disk-bridge.js` (solo al abrir desde el disco)
- `assets/img/` — fotos de las prendas en WebP (`*-lusius.webp`), emblema del titán, favicons e imagen para redes (`og-lusius.png`)
- `scripts/check_site.py` — comprobaciones de referencias locales, IDs, metadatos y sitemap
- `.github/workflows/quality.yml` — CI para comprobaciones HTML y sintaxis JavaScript
- `docs/PAGOS-STRIPE.md` — diseño de la integración de pagos (sin activar cobros)
- `_headers`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt`, `.nojekyll`

## Cambiar un producto
En `catalogo.html`, cada prenda es un `<li class="card" data-product …>`. **El precio está en dos sitios y deben coincidir:** el atributo `data-price` (lo que cobra la cesta) y el texto de `card__price` (lo que ve el cliente).

## Activar el pago
En `js/cart.js`, `CONFIG.checkoutUrl` está vacío y el botón «Finalizar compra» queda desactivado. Cuando tengas pasarela de pago o tienda, pon ahí la dirección y añade su dominio a `CONFIG.checkoutHosts` (solo se admiten URL `https`). Los precios deben validarse siempre en el servidor, nunca fiarse de la cesta del navegador. La arquitectura propuesta está documentada en [docs/PAGOS-STRIPE.md](docs/PAGOS-STRIPE.md).

## SEO: qué cambiar cuando tengas el dominio definitivo
1. Sustituye `https://www.lusiusbrand.com` por tu dominio en todos los `.html`, en `sitemap.xml` y en `robots.txt`.
2. Da de alta el sitio en Google Search Console y envía `sitemap.xml`.
3. Cuando actives el pago, añade datos estructurados `Product` con `offers` en el catálogo (hay una nota en el código).
4. Actualiza `lastmod` del sitemap al cambiar contenido.

## Publicar
- **Netlify / Cloudflare Pages:** arrastra la carpeta o conecta el repositorio de GitHub. `_headers` se aplica solo.
- **GitHub Pages:** sube la carpeta a un repositorio y activa Pages (Settings → Pages). No admite `_headers`; la política de seguridad ya va en cada página.
- Revisa siempre las condiciones de uso comercial del plan gratuito que elijas.

## Pendiente antes de publicar
- Completar los campos `[entre corchetes]` de `legal/` y quitar los avisos de borrador.
- Alojar las tipografías (Cinzel y Jost) en `assets/fonts/` en vez de cargarlas desde Google Fonts, por privacidad (RGPD).
- Confirmar que tienes derechos sobre el emblema del titán, las ilustraciones y las fotografías de las prendas.

## Novedades (17 oct 2026)
- Una página por prenda (`hoodie-zip-choices.html`, `sueter-jacquard.html`, `camiseta-spiral.html`, `manga-larga-third-eye.html`, `manga-larga-the-cycle.html`), con acordeones, migas de pan y datos estructurados de ruta.
- Imágenes en WebP con nombres descriptivos (`hoodie-zip-negro-espalda-lusius.webp`…): de ~6 MB a ~1,3 MB.
- Hero con subtítulo y botón «Ver el primer drop»; botón de ficha «Ponte la armadura»; enlace «Avísame cuando abra» en ficha y cesta.
- Pendiente antes de abrir la tienda: composición y cuidados, tabla de medidas, datos `Product` con `offers` (JSON-LD) y revisar el correo de contacto.
- Favoritos (`favoritos.html`, `js/favorites.js`, `js/favorites-page.js`, `css/favorites.css`): corazón en cada prenda, icono con contador junto a la cesta y avisos de bajada de precio o pocas unidades cuando el visitante vuelve. Precio y stock se leen de `catalogo.html` (`data-price`, y `data-stock="low"` / `"out"` para marcar pocas unidades o agotada). Los avisos por correo necesitan conectar un proveedor (ver cabecera de `js/favorites-page.js`).

## Rebranding LUSIUS (5 nov 2026)
- Identidad nueva: wordmark Cinzel, interfaz Jost, paleta obsidiana/hueso/oro antiguo y el emblema del titán como símbolo principal.
- Cabecera, pie, hero, catálogo, fichas de producto, cesta, favoritos, páginas legales y 404 adaptados a la nueva identidad.
- Fotos de las prendas sin cambios de píxeles: solo se renombraron de `*-atlas.webp` a `*-lusius.webp` y se actualizaron sus referencias y textos alternativos.
- Dominio y correo provisionales: `www.lusiusbrand.com` y `lusiusdesigntudios@gmail.com`.

## Comprobaciones
Ejecuta `python scripts/check_site.py` para revisar metadatos, IDs, enlaces y recursos locales, y `node --check js/*.js` (o el bucle equivalente de la acción) para comprobar la sintaxis JavaScript. GitHub Actions ejecuta estas comprobaciones al actualizar `main` y en pull requests.

## Seguridad
Todo lo relativo a cabeceras HTTP, CSP, Cloudflare, protección de formularios y buenas prácticas está en `SEGURIDAD.md`.
Archivos relacionados: `_headers`, `robots.txt`, `.well-known/security.txt`, `js/guard.js` (antispam de formularios) y la verificación de precios de `js/cart.js`.
