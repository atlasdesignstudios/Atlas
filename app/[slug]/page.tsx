import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "../../components/AddToCart";
import FavoriteButton from "../../components/FavoriteButton";
import Gallery from "../../components/Gallery";
import { PRODUCTS, bySlug } from "../../lib/products";
import "../css/catalog.css";
import "../css/product.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.desc,
    alternates: { canonical: `/${p.slug}` },
    openGraph: { title: p.title, description: p.desc, url: `/${p.slug}`, images: [p.front] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();

  const related = PRODUCTS.filter((x) => x.slug !== p.slug).slice(0, 4);

  return (
    <>
      <nav className="crumbs" aria-label="Migas de pan">
        <Link href="/">Inicio</Link> <span aria-hidden="true">/</span>{" "}
        <Link href="/catalogo">Catálogo</Link> <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{p.name}</span>
      </nav>

      <article className="pdp" data-product data-id={p.slug} data-name={p.name} data-price={p.cents / 100}>
        <div className="pdp__media">
          <Gallery
            p={p}
            tag="First drop · Coming soon"
            priority
            overlay={<FavoriteButton p={p} />}
          />
        </div>

        <div className="pdp__info">
          <p className="card__cat">{p.category}</p>
          <h1 className="pdp__title">{p.title}</h1>
          <p className="pdp__lead">{p.lead}</p>
          <p className="card__desc">{p.desc}</p>

          <p className="card__price">
            {(p.cents / 100).toLocaleString("es-ES")} € <span className="pdp__vat">IVA incluido</span>
          </p>
          <p className="card__sizes">
            Sizes S · M · L · XL{p.sizeNote ? ` · ${p.sizeNote}` : ""}
          </p>

          <AddToCart
            p={p}
            label="Wear the armor"
            micro="Se añade a tu cesta; todavía no se te cobra nada. Devolución en 14 días."
          />

          <p className="pdp__notify">
            The store isn&apos;t open yet.{" "}
            <Link href="/nosotros#lista-vip">Notify me when it opens</Link>
          </p>

          <div className="pdp__acc">
            <details open>
              <summary>Design details</summary>
              <ul>
                {p.design.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Size guide</summary>
              <p>
                Tallas S, M, L y XL. Antes de abrir la tienda publicaremos aquí la tabla de medidas
                de esta prenda.
              </p>
            </details>
            <details>
              <summary>Composition and care</summary>
              <p>
                Los materiales y las instrucciones de lavado se indicarán en la etiqueta de la
                prenda y aquí antes de abrir la tienda.
              </p>
            </details>
            <details>
              <summary>Envíos y devoluciones</summary>
              <p>
                Dispones de 14 días para desistir de la compra y de la garantía legal de conformidad.
                Los gastos de envío se indican antes de confirmar el pedido.{" "}
                <Link href="/legal/condiciones-venta.html#desistimiento">Cómo desistir</Link> ·{" "}
                <Link href="/legal/condiciones-venta.html">Condiciones de venta</Link>
              </p>
            </details>
          </div>
        </div>
      </article>

      <section className="related" aria-labelledby="rel-title">
        <h2 className="related__title" id="rel-title">También en el primer drop</h2>
        <ul className="related__grid">
          {related.map((r) => (
            <li key={r.slug}>
              <Link className="related__card" href={`/${r.slug}`}>
                <span className="related__media">
                  <img src={r.front} width={r.dims.front[0]} height={r.dims.front[1]} loading="lazy" alt={r.frontAlt} />
                </span>
                <span className="related__name">{r.name}</span>
                <span className="related__price">{(r.cents / 100).toLocaleString("es-ES")} €</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Datos estructurados de producto. Cuando actives el pago, añade aquí
          «offers» con precio, EUR y disponibilidad (ver README). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            description: p.desc,
            image: [p.front, p.back],
            brand: { "@type": "Brand", name: "Atlas" },
            sku: p.slug,
          }),
        }}
      />
    </>
  );
}
