"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "atlas_cookies";

/* Aviso de cookies (puerto simplificado de js/cookies.js).
   La web no instala cookies de terceros: solo almacenamiento técnico,
   que no necesita consentimiento. El aviso existe por claridad. */
export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* sin almacenamiento */
    }
    const reopen = () => setShow(true);
    window.addEventListener("atlas:cookie-settings", reopen);
    return () => window.removeEventListener("atlas:cookie-settings", reopen);
  }, []);

  function decide(analytics: boolean) {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ v: 1, ts: Date.now(), technical: true, analytics }),
      );
    } catch {
      /* sin almacenamiento */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="cookie-bar" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <div className="cookie-bar__inner">
        <p id="cookie-title" className="cookie-bar__text">
          Esta web no usa cookies de terceros: solo guarda tu cesta y tus favoritos en tu
          navegador (almacenamiento técnico, sin consentimiento).{" "}
          <Link href="/legal/cookies.html">Política de cookies</Link>
        </p>
        <div className="cookie-bar__actions">
          <button className="btn" type="button" onClick={() => decide(false)}>
            Solo lo necesario
          </button>
        </div>
      </div>
    </div>
  );
}
