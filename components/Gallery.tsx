"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Product } from "../lib/products";

/* Galería frontal / espalda con flechas (antes: js/catalog.js) */
export default function Gallery({
  p,
  tag,
  link,
  overlay,
  priority = false,
}: {
  p: Product;
  tag?: string;
  /** Ruta de la ficha; si se omite, no hay enlace superpuesto */
  link?: string;
  /** Elementos dentro de la imagen (p. ej. el botón de favoritos) */
  overlay?: ReactNode;
  priority?: boolean;
}) {
  const [view, setView] = useState<"front" | "back">("front");

  return (
    <div className="card__media">
      {link ? <Link className="card__link" href={link} tabIndex={-1} aria-hidden="true" /> : null}

      <img
        className="card__img"
        src={p.front}
        width={p.dims.front[0]}
        height={p.dims.front[1]}
        alt={p.frontAlt}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : "lazy"}
        hidden={view === "back"}
      />
      <img
        className="card__img"
        src={p.back}
        width={p.dims.back[0]}
        height={p.dims.back[1]}
        alt={p.backAlt}
        loading="lazy"
        hidden={view === "front"}
      />

      {tag ? <span className="card__tag">{tag}</span> : null}
      {overlay}

      <div className="view-arrows" role="group" aria-label="Garment view">
        <button
          type="button"
          className="view-arrows__btn view-arrows__btn--prev"
          onClick={() => setView("front")}
          disabled={view === "front"}
          aria-label="View front"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          className="view-arrows__btn view-arrows__btn--next"
          onClick={() => setView("back")}
          disabled={view === "back"}
          aria-label="View back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
