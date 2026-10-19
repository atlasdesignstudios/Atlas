/* ==========================================================================
   ATLAS — Productos
   Único origen de verdad: aquí se cambia un precio, un nombre o un stock, y
   se actualiza solo el catálogo, las fichas, la cesta y los favoritos.
   (En la web anterior el precio estaba en tres sitios y había que sincronizarlos.)
   ========================================================================== */

export type Product = {
  /** Identificador y URL: /hoodie-zip-choices */
  slug: string;
  /** Nombre que se ve en la cesta y en favoritos */
  name: string;
  /** Título de la ficha (h1) */
  title: string;
  category: string;
  /** Precio de venta en euros con IVA, en céntimos (89 = 89 €) */
  cents: number;
  lead: string;
  desc: string;
  front: string;
  back: string;
  frontAlt: string;
  backAlt: string;
  /** Dimensiones reales de la imagen (evita saltos al cargar) */
  dims: { front: [number, number]; back: [number, number] };
  design: string[];
  /** «Oversize fit», etc. Se muestra junto a las tallas */
  sizeNote?: string;
  /** Stock especial: "low" = quedan pocas, "out" = agotada */
  stock?: "low" | "out";
};

export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export const formatEuro = (cents: number) => eur.format(cents / 100);

export const PRODUCTS: Product[] = [
  {
    slug: "hoodie-zip-choices",
    name: "Hoodie Zip «Choices»",
    title: "Hoodie Zip «Choices»",
    category: "Hoodies",
    cents: 8900,
    lead: "Hoodie negro con cremallera y estampado blanco.",
    desc: "Hoodie negro con cremallera. Estampado en blanco en el pecho, la espalda y las mangas.",
    front: "/assets/img/hoodie-zip-negro-frontal-atlas.webp",
    back: "/assets/img/hoodie-zip-negro-espalda-atlas.webp",
    frontAlt: "Hoodie Atlas con cremallera, vista frontal con estampado blanco en el pecho",
    backAlt: "Hoodie Atlas con cremallera, espalda con texto gótico en blanco a gran tamaño",
    dims: { front: [710, 902], back: [681, 884] },
    design: [
      "Estampado en blanco en el pecho, la espalda y las mangas.",
      "Cremallera frontal y capucha forrada.",
      "Texto gótico «Choices» a gran tamaño en la espalda.",
    ],
  },
  {
    slug: "sueter-jacquard",
    name: "Jacquard Sweater",
    title: "Jacquard Sweater",
    category: "Sweaters",
    cents: 11000,
    lead: "Suéter de punto jacquard con figura radiante tejida.",
    desc: "Suéter de punto jacquard con una figura radiante tejida en la espalda.",
    front: "/assets/img/jersey-jacquard-negro-frontal-atlas.webp",
    back: "/assets/img/jersey-jacquard-negro-espalda-atlas.webp",
    frontAlt: "Suéter negro de punto Atlas, vista frontal con pequeño emblema en el pecho",
    backAlt: "Suéter de punto jacquard Atlas, vista trasera con figura radiante tejida",
    dims: { front: [648, 555], back: [622, 552] },
    design: [
      "Pequeño emblema Atlas tejido en el pecho.",
      "Figura radiante tejida dentro del propio punto (jacquard), no estampada.",
      "Punto denso que mantiene la forma.",
    ],
  },
  {
    slug: "camiseta-spiral",
    name: "T-shirt «Spiral»",
    title: "Camiseta oversize negra «Spiral»",
    category: "T-shirts",
    cents: 3900,
    lead: "Una espiral, un ojo y alguien corriendo hacia él.",
    desc: "Camiseta negra de manga corta. Emblema Atlas en el pecho; en la espalda, un ojo en el centro de una espiral y una figura corriendo hacia él.",
    front: "/assets/img/camiseta-oversize-negra-frontal-atlas.webp",
    back: "/assets/img/camiseta-oversize-negra-espalda-atlas.webp",
    frontAlt: "Camiseta negra Atlas, vista frontal con el emblema del titán en el pecho",
    backAlt: "Camiseta negra Atlas, vista trasera con un ojo en el centro de una espiral y una figura corriendo",
    dims: { front: [822, 788], back: [830, 812] },
    sizeNote: "Oversize fit",
    design: [
      "Emblema del titán Atlas en el pecho.",
      "Espalda: ojo en el centro de una espiral.",
      "Gráfico en blanco de alto contraste.",
    ],
  },
  {
    slug: "manga-larga-third-eye",
    name: "Long-sleeve tee «Third Eye»",
    title: "Camiseta larga blanca «Third Eye»",
    category: "Long-sleeve tees",
    cents: 5500,
    lead: "Un ojo, una figura en meditación y «We rule the city» en las mangas.",
    desc: "Camiseta larga blanca. Ojo y figura en meditación en la espalda; «We rule the city» en las mangas.",
    front: "/assets/img/camiseta-manga-larga-blanca-frontal-atlas.webp",
    back: "/assets/img/camiseta-manga-larga-blanca-espalda-atlas.webp",
    frontAlt: "Camiseta larga blanca Atlas, vista frontal con una mano y un ojo estampados",
    backAlt: "Camiseta larga blanca Atlas, vista trasera con un ojo y una figura en meditación",
    dims: { front: [624, 556], back: [640, 570] },
    design: [
      "Mano y ojo estampados en el frente.",
      "Espalda: ojo y figura en meditación.",
      "«We rule the city» en ambas mangas.",
    ],
  },
  {
    slug: "manga-larga-the-cycle",
    name: "Long-sleeve tee «The Cycle»",
    title: "Camiseta larga negra «The Cycle»",
    category: "Long-sleeve tees",
    cents: 5500,
    lead: "Ouroboros delante, «Calm face, Violent Ambition» detrás.",
    desc: "Camiseta larga negra. Serpiente ouroboros y «The cycle never ends» delante; «Calm face, Violent Ambition» detrás.",
    front: "/assets/img/camiseta-manga-larga-negra-frontal-atlas.webp",
    back: "/assets/img/camiseta-manga-larga-negra-espalda-atlas.webp",
    frontAlt: "Camiseta larga negra Atlas, vista frontal con una serpiente ouroboros y el texto «The cycle never ends»",
    backAlt: "Camiseta larga negra Atlas, vista trasera con un rostro y el texto «Calm face, Violent Ambition»",
    dims: { front: [822, 769], back: [823, 811] },
    design: [
      "Serpiente ouroboros en el pecho con «The cycle never ends».",
      "Espalda: rostro sereno con «Calm face, Violent Ambition».",
      "Manga larga negra de corte recto.",
    ],
  },
];

export const bySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);
