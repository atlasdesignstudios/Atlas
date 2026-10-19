# Atlas — Next.js + TypeScript

Versión moderna de la web de Atlas. Misma apariencia y mismas funciones
(catálogo, fichas, cesta, favoritos, formularios por correo), pero con los
precios y productos en **un solo archivo** y sin HTML duplicado.

Es una web **estática**: `next build` genera una carpeta `out/` que se sube
tal cual a Netlify, Cloudflare Pages, Vercel o GitHub Pages (todos con planes
gratis).

## Requisitos

- [Node.js](https://nodejs.org) 20 o superior (una sola vez, en tu ordenador)

## Ponerla en marcha

```bash
cd atlas-next
npm install        # la primera vez (descarga dependencias)
npm run dev        # servidor de desarrollo → http://localhost:3000
npm run build      # genera la web final en out/ (esta es la que se publica)
```

## Cambiar precios, nombres o añadir prendas

**Todo está en `lib/products.ts`.** Se cambia el precio ahí y se actualiza solo:
catálogo, ficha, cesta, favoritos y el JSON-LD. Ya no hay que sincronizar
`data-price` con el texto de la tarjeta.

- `cents` es el precio en euros **en céntimos** (con IVA): `8900` = 89 €.
- `stock: "low"` marca «pocas unidades» y `"out"` marca «agotada».
- Para añadir una prenda: copia un bloque del array, cambia los datos y pon las
  imágenes en `public/assets/img/`. La nueva ficha se genera sola.

## Activar el pago

1. Elige pasarela (Stripe Checkout, Shopify, Redsys…) y crea la sesión de pago
   en un servidor (p. ej. Vercel Functions o una Function de Netlify).
2. La cesta está preparada para eso: `lib/cart.tsx` guarda líneas con `slug`,
   `size` y `cents` validados contra el catálogo.
3. **El importe real debe calcularlo siempre el servidor o la pasarela**, nunca
   el navegador (la verificación de precios de la interfaz solo pinta la UI).
4. Cuando se pueda comprar, añade `offers` al JSON-LD de `app/[slug]/page.tsx`.

## Qué ha cambiado respecto a la web estática

| Antes | Ahora |
|---|---|
| Precio en 3 sitios por prenda | `lib/products.ts`, una sola vez |
| Cabecera, pie y cesta copiados en 15 HTML | `components/Header.tsx`, `Footer.tsx`, `CartDrawer.tsx` |
| Google Fonts (IP del visitante a Google) | `next/font`: se autoalojan en el build (RGPD resuelto) |
| `cart.js` + `favorites.js` (~35 KB imperativos) | hooks de React con el mismo comportamiento |
| CSP con `script-src 'self'` | `script-src 'self' 'unsafe-inline'` (lo necesita la hidratación de Next) |
| Doble clic en `index.html` | `npm run dev` (necesita Node.js) |

## Estructura

```
app/
  layout.tsx          cabecera, pie, cesta, cookies y tipografías
  page.tsx            portada
  catalogo/           catálogo
  [slug]/             ficha de cada prenda (se genera de lib/products.ts)
  nosotros/ contacto/ favoritos/
  not-found.tsx       página 404
  css/                la CSS original, sin tocar
components/           Header, Footer, CartDrawer, Gallery, AddToCart…
lib/
  products.ts         ★ los productos y precios
  cart.tsx            cesta (localStorage, 30 días, precios verificados)
  favorites.tsx       favoritos
public/
  assets/img/         imágenes
  legal/              las 4 páginas legales (HTML estático, sin tocar)
  _headers            cabeceras de seguridad (Netlify/Cloudflare)
  robots.txt sitemap.xml
```

## Pendiente (igual que antes)

- Completar los campos `[entre corchetes]` de `public/legal/*.html`.
- Subir `.well-known/security.txt` (no viene en el proyecto).
- Composición, cuidados y tabla de medidas en las fichas.
- Optimizar `public/assets/img/logo.png` (475 KB → ~30 KB en WebP) y
  `ojos-espiral-atlas.webp` (685 KB → ~250 KB).
- Redirects: las URLs antiguas (`/catalogo.html`) conviene redirigirlas a las
  nuevas (`/catalogo`) con `_redirects` de Netlify o equivalentes de Cloudflare.
