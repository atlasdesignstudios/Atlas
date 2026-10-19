"use client";

import { useState } from "react";
import { useCart } from "../lib/cart";
import { SIZES, type Product } from "../lib/products";

/* Selector de talla + botón de añadir a la cesta */
export default function AddToCart({
  p,
  label = "Add to cart",
  micro,
}: {
  p: Product;
  label?: string;
  /** Texto pequeño bajo el botón (ficha de producto) */
  micro?: string;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<string>("");
  const [error, setError] = useState(false);

  function onAdd() {
    if (!size) {
      setError(true);
      return;
    }
    setError(false);
    add(p, size);
  }

  return (
    <div className="card__buy">
      <fieldset className="sizes">
        <legend className="visually-hidden">Size</legend>
        <span className="sizes__label" aria-hidden="true">Size</span>
        {SIZES.map((s) => (
          <label className="size" key={s}>
            <input
              type="radio"
              name={`size-${p.slug}`}
              value={s}
              checked={size === s}
              onChange={() => {
                setSize(s);
                setError(false);
              }}
            />
            <span>{s}</span>
          </label>
        ))}
      </fieldset>

      <p className="card__error" role="alert" hidden={!error}>
        Choose a size to continue.
      </p>

      <button className="btn btn--block" type="button" onClick={onAdd}>
        {label}
      </button>

      {micro ? <p className="pdp__micro">{micro}</p> : null}
    </div>
  );
}
