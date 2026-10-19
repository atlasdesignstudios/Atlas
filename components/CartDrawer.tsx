"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "../lib/cart";
import { formatEuro } from "../lib/products";

/* El panel de la cesta, con foco y fondo inmovilizados (puerto de cart.js) */
export default function CartDrawer() {
  const { lines, qty, cents, open, setOpen, change, remove } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    document.documentElement.classList.add("cart-open");

    // Fondo inerte mientras el diálogo está abierto
    const inert: Element[] = [];
    for (const n of Array.from(document.body.children)) {
      if (n.id === "cart" || n.classList.contains("cart-overlay")) continue;
      if (!("inert" in n)) continue;
      (n as HTMLElement).inert = true;
      inert.push(n);
    }
    closeRef.current?.focus();

    return () => {
      document.documentElement.classList.remove("cart-open");
      for (const n of inert) (n as HTMLElement).inert = false;
      if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus();
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div
        className={`cart-overlay${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`cart${open ? " is-open" : ""}`}
        id="cart"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="cart__head">
          <h2 className="cart__title" id="cart-title">
            Your cart{qty > 0 ? ` (${qty})` : ""}
          </h2>
          <button
            ref={closeRef}
            className="cart__close"
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close the cart"
            tabIndex={open ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <div className="cart__body">
          <div className="cart__empty" hidden={qty > 0}>
            <p>Your cart is empty.</p>
            <button className="cart__keep" type="button" onClick={() => setOpen(false)}>
              Keep shopping
            </button>
          </div>

          <ul className="cart__list" hidden={qty === 0}>
            {lines.map((l) => (
              <li className="cart-item" key={`${l.slug}|${l.size}`} data-id={l.slug} data-size={l.size}>
                <div className="cart-item__media">
                  <img className="cart-item__img" src={l.img} alt="" />
                </div>
                <div className="cart-item__info">
                  <p className="cart-item__name">{l.name}</p>
                  <p className="cart-item__meta">
                    Size {l.size} · {formatEuro(l.cents)}
                  </p>
                  <div className="cart-item__qty" role="group" aria-label={`Quantity of ${l.name}, size ${l.size}`}>
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => change(l.slug, l.size, -1)}
                      disabled={l.qty <= 1}
                      aria-label="One less"
                    >
                      −
                    </button>
                    <span className="qty-num">{l.qty}</span>
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => change(l.slug, l.size, 1)}
                      disabled={l.qty >= 10}
                      aria-label="One more"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item__side">
                  <p className="cart-item__price">{formatEuro(l.qty * l.cents)}</p>
                  <button
                    className="cart-item__remove"
                    type="button"
                    onClick={() => remove(l.slug, l.size)}
                    aria-label={`Remove ${l.name}, size ${l.size}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="cart__foot" hidden={qty === 0}>
          <p className="cart__total">
            <span>Subtotal · IVA incluido</span>
            <strong>{formatEuro(cents)}</strong>
          </p>
          <p className="cart__note">Los gastos de envío se indican antes de confirmar el pedido.</p>
          {/* Desactivado hasta configurar el pago en el checkout (ver README) */}
          <button className="btn btn--block" type="button" disabled>
            Checkout
          </button>
          <p className="cart__note cart__soon">
            Checkout will be enabled when the store opens.{" "}
            <Link href="/nosotros#lista-vip">Notify me when it opens</Link>
          </p>
        </div>
      </aside>
    </>
  );
}
