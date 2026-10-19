import Link from "next/link";
import CookieSettingsButton from "./CookieSettingsButton";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">Atlas</p>

        <nav aria-label="Información legal">
          <ul className="legal-links">
            <li><Link href="/legal/aviso-legal.html">Aviso legal</Link></li>
            <li><Link href="/legal/privacidad.html">Política de privacidad</Link></li>
            <li><Link href="/legal/cookies.html">Política de cookies</Link></li>
            <li><Link href="/legal/condiciones-venta.html">Condiciones de venta</Link></li>
            <li><CookieSettingsButton /></li>
          </ul>
        </nav>

        <p className="site-footer__copy">
          © 2026 Dayae Hamioud · NIF X9517224P ·{" "}
          <a href="mailto:atlasdesigntudios@gmail.com">atlasdesigntudios@gmail.com</a>
          <br />
          Todos los derechos reservados. Atlas es una marca de Dayae Hamioud.
        </p>
      </div>
    </footer>
  );
}
