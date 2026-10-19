"use client";

/** Abre de nuevo el panel de cookies (lo escucha CookieBanner) */
export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("atlas:cookie-settings"))}
    >
      Configurar cookies
    </button>
  );
}
