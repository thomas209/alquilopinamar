import { UsarLink } from "@/components/site/IngresoCuenta";
import { metadataDePagina } from "@/lib/seo";

export const metadata = {
  ...metadataDePagina({
    titulo: "Entrar",
    descripcion: "Terminá de entrar a tu cuenta de AlquiloPinamar.",
    ruta: "/cuenta/entrar",
    noIndexar: true,
  }),
  // El token va en la URL: que no viaje a otros sitios en el Referer
  referrer: "no-referrer" as const,
};

export default async function EntrarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  return <UsarLink token={token} />;
}
