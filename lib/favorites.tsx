/* ==========================================================================
   ATLAS — Favoritos (puerto de js/favorites.js a React)
   Se guardan en el navegador. Al volver, la página compara el precio
   guardado con el actual del catálogo para avisar de bajadas de precio.
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
import { PRODUCTS, type Product } from "./products";

const KEY = "atlas_favs";
const MAX_AGE_DAYS = 180;
const MAX_FAVS = 30;

export type FavItem = { slug: string; cents: number; ts: number };

function load(): FavItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const d = JSON.parse(raw) as { v?: number; ts?: number; items?: FavItem[] };
    if (!d || d.v !== 1 || !Array.isArray(d.items)) return [];
    if (typeof d.ts === "number" && Date.now() - d.ts > MAX_AGE_DAYS * 86400000) return [];
    return d.items
      .filter((it) => it && PRODUCTS.some((p) => p.slug === it.slug))
      .slice(0, MAX_FAVS)
      .map((it) => {
        const p = PRODUCTS.find((x) => x.slug === it.slug)!;
        return { slug: p.slug, cents: p.cents, ts: Number(it.ts) || Date.now() };
      });
  } catch {
    return [];
  }
}

type FavValue = {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (p: Product) => void;
  remove: (slug: string) => void;
  /** Precio registrado al guardar (para detectar bajadas) */
  savedCents: (slug: string) => number | undefined;
};

const FavContext = createContext<FavValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // no se escribe nada antes de leer lo guardado
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), items }));
    } catch {
      /* sin almacenamiento */
    }
  }, [items, hydrated]);

  const toggle = useCallback((p: Product) => {
    setItems((prev) => {
      if (prev.some((it) => it.slug === p.slug)) return prev.filter((it) => it.slug !== p.slug);
      if (prev.length >= MAX_FAVS) return prev;
      return [...prev, { slug: p.slug, cents: p.cents, ts: Date.now() }];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((it) => it.slug !== slug));
  }, []);

  const value = useMemo<FavValue>(
    () => ({
      slugs: items.map((it) => it.slug),
      count: items.length,
      has: (slug: string) => items.some((it) => it.slug === slug),
      toggle,
      remove,
      savedCents: (slug: string) => items.find((it) => it.slug === slug)?.cents,
    }),
    [items, toggle, remove],
  );

  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export function useFavorites(): FavValue {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return ctx;
}

export { PRODUCTS };
