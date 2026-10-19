import Link from "next/link";
import "./css/lookbook.css";

const LOOKS = [
  { cls: "look look--tall", n: "01" },
  { cls: "look", n: "02" },
  { cls: "look", n: "03" },
  { cls: "look", n: "04" },
  { cls: "look look--wide", n: "05" },
  { cls: "look", n: "06" },
];

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero" aria-labelledby="hero-title">
        <h1 className="hero__title" id="hero-title">WE RULE THE CITY</h1>
        <Link className="btn" href="/catalogo">Ver primer drop</Link>
      </section>

      {/* ============ MENSAJE DE MARCA + VENTAJAS ============ */}
      <section className="manifesto" aria-labelledby="manifiesto-title">
        <div className="manifesto__intro">
          <div className="manifesto__copy">
            <h2 className="manifesto__quote" id="manifiesto-title">
              Atlas dresses those who carry their own world
            </h2>
            <p className="manifesto__text">
              Atlas es una marca independiente de <strong>streetwear en blanco y negro</strong>:
              hoodie con cremallera, suéter jacquard, camisetas y camisetas largas con gráficos de
              carácter. Descubre el primer drop y encuentra tu talla, de la S a la XL.
            </p>
          </div>
          <figure className="manifesto__media">
            <img
              src="/assets/img/ojos-espiral-atlas.webp"
              alt="Animación en blanco y negro de ojos girando en espiral hacia el centro"
              width={540}
              height={540}
              loading="lazy"
            />
          </figure>
        </div>

        <ul className="perks">
          <li className="perk">
            <p className="perk__title">First drop</p>
            <p className="perk__text">Cinco piezas en blanco y negro, diseñadas por Atlas.</p>
          </li>
          <li className="perk">
            <p className="perk__title">Devolución en 14 días</p>
            <p className="perk__text">
              Si no es lo que esperabas, puedes desistir sin dar explicaciones.{" "}
              <Link href="/legal/condiciones-venta.html#desistimiento">Cómo hacerlo</Link>
            </p>
          </li>
          <li className="perk">
            <p className="perk__title">Garantía legal</p>
            <p className="perk__text">
              Todas las prendas cuentan con la garantía legal de conformidad.{" "}
              <Link href="/legal/condiciones-venta.html#garantia">Más información</Link>
            </p>
          </li>
        </ul>
      </section>

      {/* ============ LOOKBOOK · EN LA CALLE ============ */}
      <section className="lookbook" aria-labelledby="lookbook-title">
        <p className="lookbook__kicker">Lookbook</p>
        <h2 className="lookbook__title" id="lookbook-title">On the street</h2>
        <p className="lookbook__lead">
          Noche, hormigón y grano analógico. Las primeras fotos llegan con el primer drop.
        </p>
        <ul className="lookbook__grid">
          {LOOKS.map((look) => (
            <li className={look.cls} key={look.n}>
              <figure className="look__frame">
                <div className="look__slot" aria-hidden="true" />
                <figcaption className="look__cap">Look {look.n} · Coming soon</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <Link className="btn" href="/catalogo">Ver Catálogo</Link>
      </section>
    </>
  );
}
