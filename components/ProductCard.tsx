import Link from "next/link";
import AddToCart from "./AddToCart";
import FavoriteButton from "./FavoriteButton";
import Gallery from "./Gallery";
import { formatEuro, type Product } from "../lib/products";

/* Tarjeta del catálogo (antes: un bloque <li> copiado por prenda) */
export default function ProductCard({ p }: { p: Product }) {
  return (
    <li className="card" data-product data-id={p.slug} data-name={p.name} data-price={p.cents / 100}>
      <Gallery
        p={p}
        link={`/${p.slug}`}
        tag={p.stock === "out" ? "Agotada" : p.stock === "low" ? "Pocas unidades" : "Coming soon"}
        overlay={<FavoriteButton p={p} />}
      />
      <div className="card__body">
        <p className="card__cat">{p.category}</p>
        <h2 className="card__name">
          <Link href={`/${p.slug}`}>{p.name}</Link>
        </h2>
        <p className="card__desc">{p.desc}</p>
        <p className="card__price">{formatEuro(p.cents)}</p>
        <p className="card__sizes">
          Sizes S · M · L · XL{p.sizeNote ? ` · ${p.sizeNote}` : ""}
        </p>
        <AddToCart p={p} />
      </div>
    </li>
  );
}
