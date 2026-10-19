/* ==========================================================================
   ATLAS — Cesta (puerto de js/cart.js a React)
   · Se guarda en el navegador (localStorage) durante 30 días.
   · Nada de lo guardado se da por bueno: al cargar se verifica contra
     lib/products.ts (la fuente de precios) y se corrige o se elimina.
     Importante: esto protege la interfaz, no el cobro. El importe real debe
     validarse siempre en el servidor o en la pasarela de pago.
   ========================================================================== */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, SIZES, type Product } from "./products";

const KEY = "atlas_cart";
const MAX_AGE_DAYS = 30;
const MAX_PER_LINE = 10;
const MAX_LINES = 20;

export type CartLine = {
  slug: string;
  name: string;
  size: string;
  cents: number;
  qty: number;
  img: string;
};

type Stored = { v: 1; ts: number; items: CartLine[] };

function load(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw || raw.length > 20000) return [];
    const d = JSON.parse(raw) as Stored;
    if (!d || d.v !== 1 || !Array.isArray(d.items) || typeof d.ts !== "number") return [];
    if (Date.now() - d.ts > MAX_AGE_DAYS * 86400000) return [];

    const out: CartLine[] = [];
    for (const it of d.items) {
      const p = PRODUCTS.find((x) => x.slug === it?.slug);
      if (!p) continue; // prenda que ya no existe
      if (!SIZES.includes(it.size as never)) continue;
      const qty = Math.min(Math.max(parseInt(String(it.qty), 10) || 1, 1), MAX_PER_LINE);
      // precio y nombre SIEMPRE desde el catálogo, nunca desde lo guardado
      out.push({ slug: p.slug, name: p.name, size: it.size, cents: p.cents, qty, img: p.front });
      if (out.length >= MAX_LINES) break;
    }
    return out;
  } catch {
    return [];
  }
}

type CartValue = {
  lines: CartLine[];
  qty: number;
  cents: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, size: string) => void;
  change: (slug: string, size: string, delta: number) => void;
  remove: (slug: string, size: string) => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Se lee al montar (no en el servidor) para no descuadrar el hidratado
  useEffect(() => {
    setLines(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // no se escribe nada antes de leer lo guardado
    try {
      const data: Stored = { v: 1, ts: Date.now(), items: lines };
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* sin almacenamiento */
    }
  }, [lines, hydrated]);

  const add = useCallback((p: Product, size: string) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === p.slug && l.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + 1, MAX_PER_LINE) };
        return next;
      }
      if (prev.length >= MAX_LINES) return prev;
      return [...prev, { slug: p.slug, name: p.name, size, cents: p.cents, qty: 1, img: p.front }];
    });
    setOpen(true);
  }, []);

  const change = useCallback((slug: string, size: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.slug === slug && l.size === size
          ? { ...l, qty: Math.min(Math.max(l.qty + delta, 1), MAX_PER_LINE) }
          : l,
      ),
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const { qty, cents } = useMemo(() => {
    let q = 0,
      c = 0;
    for (const l of lines) {
      q += l.qty;
      c += l.qty * l.cents;
    }
    return { qty: q, cents: c };
  }, [lines]);

  const value: CartValue = { lines, qty, cents, open, setOpen, add, change, remove };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

/** Precio validado contra el catálogo, para mostrar o cobrar */
export function catalogPrice(slug: string): number | null {
  const p = PRODUCTS.find((x) => x.slug === slug);
  return p ? p.cents : null;
}
