"use client";

import Link from "next/link";
import { useFavorites } from "../../lib/favorites";
import { PRODUCTS, formatEuro, type Product } from "../../lib/products";
import MailForm from "../../components/MailForm";

function FavCard({ p, savedCents, onRemove }: { p: Product; savedCents?: number; onRemove: () => void }) {
  const dropped = typeof savedCents === "number" && savedCents > p.cents;

  return (
    <li className="fav-card">
      <span className="fav-card__media">
        <img src={p.front} alt={p.frontAlt} width={p.dims.front[0]} height={p.dims.front[1]} loading="lazy" />
      </span>
      <div className="fav-card__body">
        <p className="fav-card__name">
          <Link href={`/${p.slug}`}>{p.name}</Link>
        </p>
        <p className="fav-card__price">
          {formatEuro(p.cents)}
          {dropped ? <span className="fav-card__was">{formatEuro(savedCents!)}</span> : null}
        </p>

        {dropped ? (
          <p className="fav-card__alert" role="status">
            <strong>Precio bajado</strong> — estaba a {formatEuro(savedCents!)} cuando la guardaste.
          </p>
        ) : null}
        {p.stock === "low" ? (
          <p className="fav-card__alert" role="status"><strong>Pocas unidades</strong> — si la quieres, no esperes.</p>
        ) : null}
        {p.stock === "out" ? (
          <p className="fav-card__alert" role="status"><strong>Agotada</strong> — de momento sin stock.</p>
        ) : null}

        <div className="fav-card__actions">
          <Link className="btn" href={`/${p.slug}`}>Ver la prenda</Link>
          <button className="fav-card__remove" type="button" onClick={onRemove}>
            Quitar de favoritos
          </button>
        </div>
      </div>
    </li>
  );
}

export default function FavoritesView() {
  const { slugs, savedCents, remove } = useFavorites();
  const items = PRODUCTS.filter((p) => slugs.includes(p.slug));

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Favorites</h1>
        <p className="page__lead">Save what you want. We&apos;ll tell you if it changes</p>
      </header>

      <section className="favs" aria-labelledby="favs-title">
        <h2 className="visually-hidden" id="favs-title">Your saved items</h2>

        {items.length === 0 ? (
          <div className="favs__empty">
            <p>
              Aún no has guardado nada. Toca el corazón de una prenda del catálogo y aparecerá aquí.
              Si baja de precio o quedan pocas unidades, te lo diremos en cuanto vuelvas.
            </p>
            <Link className="btn" href="/catalogo">Ver catálogo</Link>
          </div>
        ) : (
          <ul className="favs__grid">
            {items.map((p) => (
              <FavCard p={p} savedCents={savedCents(p.slug)} onRemove={() => remove(p.slug)} key={p.slug} />
            ))}
          </ul>
        )}
      </section>

      {items.length > 0 ? (
        <section className="favs-mail" aria-labelledby="favs-mail-title">
          <p className="kicker">Email alerts</p>
          <h2 className="favs-mail__title" id="favs-mail-title">Don&apos;t miss a price drop</h2>
          <p className="favs-mail__text">
            Déjanos tu correo y te escribimos si alguna de tus prendas baja de precio o se queda con
            pocas unidades.
          </p>

          <MailForm
            variant="favs"
            idPrefix="favs"
            className="favs-mail__form"
            subject="Avisos de favoritos Atlas"
            bodyIntro="Quiero recibir avisos de precio y stock de mis prendas favoritas de Atlas."
            submitLabel="Turn on alerts"
            consentLabel={
              <>
                Quiero recibir por correo electrónico avisos sobre las prendas que he guardado. He
                leído la <Link href="/legal/privacidad.html">política de privacidad</Link> y sé que
                puedo darme de baja cuando quiera.
              </>
            }
          />

          <p className="favs-mail__note">
            Tus favoritos se guardan solo en este navegador. Aquí verás los avisos cada vez que
            vuelvas.
          </p>
        </section>
      ) : null}
    </div>
  );
}
