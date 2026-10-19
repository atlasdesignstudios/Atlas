import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "../../components/ProductCard";
import { PRODUCTS } from "../../lib/products";
import "../css/catalog.css";

export const metadata: Metadata = {
  title: "Catálogo de ropa urbana: hoodies, suéteres y camisetas",
  description:
    "Hoodie con cremallera, suéter jacquard, camiseta y camisetas largas en blanco y negro. Tallas S–XL, desde 39 € con IVA incluido y 14 días para desistir.",
  alternates: { canonical: "/catalogo" },
  openGraph: { title: "Catálogo de ropa urbana: hoodies, suéteres y camisetas", url: "/catalogo" },
};

export default function Catalogo() {
  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <header className="catalog__head">
        <h1 className="catalog__title" id="catalog-title">Catálogo</h1>
        <p className="catalog__lead">Ropa para quienes cargan su propio mundo</p>
        <p className="catalog__intro">
          El primer drop de Atlas reúne cinco prendas de{" "}
          <strong>ropa urbana en blanco y negro</strong>: un hoodie con cremallera, un suéter de
          punto jacquard, una camiseta y dos camisetas largas. Todas en tallas S, M, L y XL.
        </p>
      </header>

      <ul className="grid">
        {PRODUCTS.map((p) => (
          <ProductCard p={p} key={p.slug} />
        ))}
      </ul>

      <p className="catalog__note">
        Precios en euros, IVA incluido.
        <br />
        Las imágenes son diseños de presentación y pueden diferir del producto final.
        <br />
        Consulta las <Link href="/legal/condiciones-venta.html">Condiciones de venta</Link>.
      </p>
    </section>
  );
}
