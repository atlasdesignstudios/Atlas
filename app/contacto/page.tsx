import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import "../css/pages.css";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbe a Atlas: pedidos, devoluciones, tallas y colaboraciones.",
  alternates: { canonical: "/contacto" },
  openGraph: { title: "Contacto", url: "/contacto" },
};

export default function Contacto() {
  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Contacto</h1>
        <p className="page__lead">Write to us and we&apos;ll reply as soon as we can</p>
      </header>

      <div className="contact">
        <div className="contact__info">
          <h2 className="kicker">Direct channels</h2>
          <dl className="contact__list">
            <div>
              <dt>Correo</dt>
              <dd><a href="mailto:atlasdesigntudios@gmail.com">atlasdesigntudios@gmail.com</a></dd>
            </div>
          </dl>

          <h2 className="kicker">Before you write</h2>
          <ul className="contact__links">
            <li><a href="/legal/condiciones-venta.html#desistimiento">Devoluciones y desistimiento (14 días)</a></li>
            <li><a href="/legal/condiciones-venta.html#garantia">Garantía legal de las prendas</a></li>
            <li><a href="/legal/privacidad.html#derechos">Ejercer tus derechos de privacidad</a></li>
            <li><a href="/legal/aviso-legal.html">Datos del titular y domicilio</a></li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
