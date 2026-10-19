# Para la sesión de Claude conectada al repositorio

## Qué es esto

Versión Next.js 15 + TypeScript de la web de la marca **Atlas** (streetwear, estática,
sin backend). Compila y se probó localmente: build OK, 13 páginas, 0 errores de consola.

## Cómo publicarla desde este repositorio

1. **Si el dominio es `atlasstudiobrand.com` apuntando a GitHub Pages**
   (Settings → Pages → Source: **GitHub Actions**): ya está todo listo, el workflow
   `.github/workflows/deploy.yml` compila (`npm run build`) y publica la carpeta `out/`
   en cada push a `main`. En Settings → Pages → Custom domain poner `atlasstudiobrand.com`
   (y el CNAME de DNS).
2. **Si es Netlify o Cloudflare Pages**: conectar el repo, build command `npm run build`,
   publish directory `out`. Allí funciona además el archivo `public/_headers`
   (cabeceras de seguridad: CSP, HSTS, etc.). GitHub Pages **no aplica** esas cabeceras.
3. **Si la web vive en una subcarpeta** (`usuario.github.io/repo/`), hay que añadir
   `basePath: "/repo"` en `next.config.mjs`, porque las rutas de imágenes y CSS son
   absolutas (`/assets/...`). Con dominio propio no hace falta nada.

## Reglas de la casa (importante)

- **Precios y productos: solo se tocan en `lib/products.ts`.** De ahí salen catálogo,
  fichas, cesta, favoritos y JSON-LD. `cents` son euros × 100 (`8900` = 89 € con IVA).
  `stock: "low"` / `"out"` marca «pocas unidades» / «agotada».
- **Añadir una prenda** = copiar un bloque en `lib/products.ts` + subir las imágenes
  a `public/assets/img/`. La ficha se genera sola.
- **El checkout está desactivado a propósito** (la tienda aún no abre). Para activarlo:
  pasarela de pago (Stripe Checkout, etc.) + API route; el importe debe validarlo el
  servidor, nunca el navegador. Cuando haya pago real, añadir `offers` al JSON-LD de
  `app/[slug]/page.tsx`.
- Los formularios (VIP, contacto, avisos de favoritos) **no envían nada a un servidor**:
  abren el correo del visitante (igual que la web original). Si se conecta un proveedor
  (Buttondown, Mailchimp…), ampliar la CSP de `public/_headers` con el `connect-src`.
- No meter librerías UI nuevas sin necesidad: el diseño va con la CSS original
  (`app/css/`) y las fuentes se autoalojan con `next/font` (sin Google Fonts, por RGPD).

## Pendiente (heredado de la web anterior)

- Rellenar los campos `[entre corchetes]` de `public/legal/*.html`
  (titular, NIF, domicilio, registro, teléfono…).
- Optimizar imágenes: `public/assets/img/logo.png` (475 KB ≈ debe pesar ~30 KB en WebP)
  y `ojos-espiral-atlas.webp` (685 KB ≈ ~250 KB).
- Tabla de medidas, composición y cuidados en `lib/products.ts` → acordeones de las fichas.
- Subir `.well-known/security.txt` a `public/.well-known/`.
- Posibles redirecciones: URLs antiguas `*.html` → nuevas (`/catalogo.html` → `/catalogo`).

## Comandos

```bash
npm install
npm run dev      # desarrollo → http://localhost:3000
npm run build    # genera la web estática en out/
```

Requiere Node.js 20+.
