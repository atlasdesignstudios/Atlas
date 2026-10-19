"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../lib/cart";
import { useFavorites } from "../lib/favorites";

const NAV_RIGHT = [
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const pathname = usePathname();
  const { qty, setOpen } = useCart();
  const { count: favCount } = useFavorites();
  const [openMenu, setOpenMenu] = useState(false);

  // Cierra el menú al cambiar de página
  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  // Cierra con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`site-header has-favs${openMenu ? " is-open" : ""}`} id="inicio">
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={openMenu}
        aria-controls="menu"
        onClick={() => setOpenMenu((v) => !v)}
      >
        <span className="menu-toggle__bars" aria-hidden="true" />
        <span className="visually-hidden">Menu</span>
      </button>

      <Link className="logo" href="/" aria-label="Atlas, ir al inicio">
        <img src="/assets/img/logo.png" alt="Atlas" width={896} height={1199} />
      </Link>

      <nav className="site-nav" id="menu" aria-label="Principal">
        <ul className="nav-list nav-list--left">
          <li>
            <Link href="/catalogo" aria-current={pathname === "/catalogo" ? "page" : undefined}>
              Catálogo
            </Link>
          </li>
        </ul>
        <ul className="nav-list nav-list--right">
          {NAV_RIGHT.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Favoritos: el CSS de favorites.css ya lo coloca en la cabecera */}
      <Link
        className="fav-link"
        href="/favoritos"
        aria-label={`Favoritos (${favCount})`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-9.4A4 4 0 0 1 12 8a4 4 0 0 1 7 2.6c0 5-7 9.4-7 9.4z" />
        </svg>
        <span className="fav-count" hidden={favCount === 0}>
          {favCount}
        </span>
      </Link>

      <button
        className="cart-button"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-controls="cart"
        aria-label={qty === 0 ? "Open the cart (empty)" : `Open the cart (${qty} items)`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <path d="M5.5 8h13l-1.2 12H6.7L5.5 8z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
        <span className="cart-count" hidden={qty === 0}>
          {qty > 99 ? "99+" : qty}
        </span>
      </button>
    </header>
  );
}
