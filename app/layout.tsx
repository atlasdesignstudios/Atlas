import type { Metadata, Viewport } from "next";
import { Jost, Pirata_One } from "next/font/google";
import "./css/styles.css";
import "./css/cart.css";
import "./css/favorites.css";
import "./globals.css";
import CartDrawer from "../components/CartDrawer";
import CookieBanner from "../components/CookieBanner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CartProvider } from "../lib/cart";
import { FavoritesProvider } from "../lib/favorites";

/* next/font descarga las tipografías en el build y las sirve desde el propio
   dominio: se acaba el envío de la IP a Google Fonts (RGPD) y la petición
   extra al cargar. */
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const pirata = Pirata_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pirata",
  display: "swap",
});

const DESCRIPTION =
  "Atlas es una marca independiente de streetwear en blanco y negro: hoodie con cremallera, suéter jacquard, camisetas y camisetas largas. Primer drop.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atlasstudiobrand.com"),
  title: { default: "Atlas | We rule the city", template: "%s | Atlas" },
  description: DESCRIPTION,
  applicationName: "Atlas",
  authors: [{ name: "Dayae Hamioud" }],
  icons: {
    icon: "/assets/img/favicon.png",
    apple: "/assets/img/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Atlas",
    locale: "es_ES",
    title: "Atlas — Streetwear en blanco y negro | We rule the city",
    description: DESCRIPTION,
    images: [
      {
        url: "/assets/img/og.jpg",
        width: 1200,
        height: 630,
        alt: "Collage en blanco y negro: una espiral, un pasillo de líneas y el nombre Atlas en letra gótica dentro de un ojo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas — Streetwear en blanco y negro | We rule the city",
    description: DESCRIPTION,
    images: ["/assets/img/og.jpg"],
  },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jost.variable} ${pirata.variable}`}>
      <body>
        <CartProvider>
          <FavoritesProvider>
            <a className="skip-link" href="#contenido">Skip to content</a>
            <Header />
            <main id="contenido">{children}</main>
            <Footer />
            <CartDrawer />
            <CookieBanner />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
