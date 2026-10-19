import type { Metadata } from "next";
import FavoritesView from "./FavoritesView";
import "../css/pages.css";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus prendas favoritas de Atlas, con aviso si baja el precio o quedan pocas unidades.",
  robots: { index: false, follow: true },
};

export default function Favoritos() {
  return <FavoritesView />;
}
