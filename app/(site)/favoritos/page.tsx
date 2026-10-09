import Favoritos from "@/components/site/Favoritos";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Tus favoritos",
  descripcion: "Las propiedades que guardaste en AlquiloPinamar, para compararlas y compartirlas.",
  ruta: "/favoritos",
  noIndexar: true,
});

export default function FavoritosPage() {
  return <Favoritos />;
}
