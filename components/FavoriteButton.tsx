"use client";

import { useFavorites } from "../lib/favorites";
import type { Product } from "../lib/products";

export default function FavoriteButton({ p }: { p: Product }) {
  const { has, toggle } = useFavorites();
  const on = has(p.slug);

  return (
    <button
      className="fav-btn"
      type="button"
      aria-pressed={on}
      aria-label={on ? `Quitar ${p.name} de favoritos` : `Guardar ${p.name} en favoritos`}
      onClick={() => toggle(p)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6c0 5-7 9.4-7 9.4z" />
      </svg>
    </button>
  );
}
