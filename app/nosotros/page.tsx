import type { Metadata } from "next";
import Link from "next/link";
import MailForm from "../../components/MailForm";
import { PRODUCTS, formatEuro } from "../../lib/products";
import "../css/pages.css";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Atlas es una marca independiente de streetwear en blanco y negro con base en Valencia, inspirada en el titán que sostiene el mundo.",
  alternates: { canonical: "/nosotros" },
  openGraph: { title: "About Atlas", url: "/nosotros" },
};

export default function Nosotros() {
  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">About Atlas</h1>
        <p className="page__lead">Those who carry their world don&apos;t ask permission</p>
      </header>

      {/* MANIFIESTO (NUESTRA HISTORIA) */}
      <section className="story creed" aria-labelledby="historia-title">
        <figure className="story__media">
          <img
            src="/assets/img/logo.png"
            width={896}
            height={1199}
            alt="Logotipo de Atlas: el titán arrodillado sosteniendo el mundo sobre los hombros, con el nombre Atlas en letra gótica"
          />
        </figure>
        <div className="story__text">
          <p className="kicker">Our story</p>
          <h2 className="story__title" id="historia-title">
            Hold your weight. Walk without asking permission.
          </h2>

          <p className="creed__verse">
            Zeus condenó a Atlas a sostener el cielo.
            <br />
            Sin descanso. Sin testigos. Sin preguntar si podía.
          </p>
          <p className="creed__verse">
            Nosotros no vinimos a quejarnos del peso.
            <br />
            Vinimos a aprender a caminar con él.
          </p>
          <p className="creed__verse">
            Ciudad de noche. Hormigón frío. Una luz que no es para ti.
            <br />
            Aquí nadie te regala nada: la calle se gana.
          </p>
          <p className="creed__verse">
            No vestimos a todo el mundo. Vestimos a una tribu:
            <br />
            la de quienes callan, aguantan y se levantan otra vez.
          </p>
          <blockquote className="creed__quote">
            <p>Calm face. Violent ambition.</p>
          </blockquote>
          <p className="creed__verse">
            Las decisiones tomadas con rabia no se deshacen.
            <br />
            Por eso respiramos primero y golpeamos después.
          </p>
          <p className="creed__verse creed__verse--last">
            Si cargas algo que nadie ve, esta es tu casa.
            <br />
            <strong>We rule the city. The cycle never ends.</strong>
          </p>
        </div>
      </section>

      {/* CALIDAD DE ARMADURA */}
      <section className="armor" aria-labelledby="armadura-title">
        <p className="kicker">Armor quality</p>
        <h2 className="section-title" id="armadura-title">Built to hold the weight</h2>
        <ul className="armor__list">
          <li className="armor__item">
            <span className="armor__num" aria-hidden="true">01</span>
            <h3 className="armor__title">Heavyweight fabric</h3>
            <p>Tejido denso que cae con peso y mantiene la forma. Se nota en la mano antes de ponértela.</p>
          </li>
          <li className="armor__item">
            <span className="armor__num" aria-hidden="true">02</span>
            <h3 className="armor__title">Woven jacquard knit</h3>
            <p>
              En el suéter, la figura no se estampa encima: se teje dentro del propio punto.
              Pensada para no cuartearse ni despegarse.
            </p>
          </li>
          <li className="armor__item">
            <span className="armor__num" aria-hidden="true">03</span>
            <h3 className="armor__title">Independent making</h3>
            <p>Marca independiente con base en Valencia. Sin fast fashion y sin prisas: cada acabado importa.</p>
          </li>
          <li className="armor__item">
            <span className="armor__num" aria-hidden="true">04</span>
            <h3 className="armor__title">Limited run</h3>
            <p>Cada drop se produce en cantidad cerrada. Cuando se agota, se acabó.</p>
          </li>
        </ul>
        <p className="armor__price">
          <Link href="/sueter-jacquard">Jacquard Sweater · {formatEuro(11000)}</Link>
          <span aria-hidden="true">/</span>{" "}
          <Link href="/hoodie-zip-choices">Hoodie Zip «Choices» · {formatEuro(8900)}</Link>
        </p>
        <p className="armor__note">No pagas una etiqueta. Pagas peso, tejido y una tirada que no se repite.</p>
      </section>

      {/* PRIMER DROP: enlaces al catálogo */}
      <section className="range" aria-labelledby="capsula-title">
        <p className="kicker">The first drop</p>
        <h2 className="section-title" id="capsula-title">Five pieces, one idea</h2>
        <ul className="range__list">
          {PRODUCTS.map((p) => (
            <li key={p.slug}>
              <Link className="range__card" href={`/${p.slug}`}>
                <span className="range__media">
                  <img src={p.front} width={p.dims.front[0]} height={p.dims.front[1]} loading="lazy" alt={p.frontAlt} />
                </span>
                <span className="range__name">{p.name}</span>
                <span className="range__price">{formatEuro(p.cents)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* LISTA VIP · DROP PRIVADO */}
      <section className="vip" id="lista-vip" aria-labelledby="vip-title">
        <p className="kicker">VIP list · Drop I</p>
        <h2 className="vip__title" id="vip-title">Get in before the door closes</h2>
        <p className="vip__text">Los drops de Atlas no se reponen. Quien está en la lista entra primero.</p>
        <ul className="vip__perks">
          <li>Acceso 24 h antes del Drop I</li>
          <li>Numbered units only</li>
          <li>One alert when we open. Nothing else</li>
        </ul>

        <MailForm
          variant="vip"
          idPrefix="vip"
          className="vip__form"
          subject="Lista VIP Atlas"
          bodyIntro="Quiero entrar en la lista VIP del Drop I de Atlas."
          submitLabel="Join the list"
          consentLabel={
            <>
              Quiero recibir el aviso del Drop I y novedades de Atlas por correo electrónico. He
              leído la <Link href="/legal/privacidad.html">política de privacidad</Link> y sé que
              puedo darme de baja cuando quiera.
            </>
          }
        />

        <Link className="link-line" href="/catalogo">Ver el catálogo</Link>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="faq" aria-labelledby="faq-title">
        <p className="kicker">Preguntas frecuentes</p>
        <h2 className="section-title" id="faq-title">Antes de elegir tu prenda</h2>
        <div className="faq__list">
          <details className="faq__item">
            <summary>¿Qué es Atlas?</summary>
            <p>
              Una marca independiente de streetwear en blanco y negro con base en Valencia,
              inspirada en el titán que sostiene el mundo.
            </p>
          </details>
          <details className="faq__item">
            <summary>¿Qué prendas tiene el primer drop?</summary>
            <p>
              Un hoodie con cremallera, un suéter de punto jacquard, una camiseta y dos camisetas
              largas (blanca y negra). Puedes verlas todas en el <Link href="/catalogo">catálogo</Link>.
            </p>
          </details>
          <details className="faq__item">
            <summary>¿Qué tallas hay disponibles?</summary>
            <p>S, M, L y XL en todas las prendas.</p>
          </details>
          <details className="faq__item">
            <summary>¿Puedo devolver una prenda?</summary>
            <p>
              Sí. Tienes 14 días naturales para desistir de la compra sin dar explicaciones. Te
              explicamos cómo hacerlo en las{" "}
              <Link href="/legal/condiciones-venta.html#desistimiento">Condiciones de venta</Link>.
            </p>
          </details>
          <details className="faq__item">
            <summary>¿Cómo puedo contactar con Atlas?</summary>
            <p>
              Por correo en <a href="mailto:atlasdesigntudios@gmail.com">atlasdesigntudios@gmail.com</a>{" "}
              o con el <Link href="/contacto">formulario de contacto</Link>.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
