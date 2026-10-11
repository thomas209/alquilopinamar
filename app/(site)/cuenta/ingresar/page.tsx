import { redirect } from "next/navigation";
import { PedirLink } from "@/components/site/IngresoCuenta";
import { metadataDePagina } from "@/lib/seo";
import { rutaVolver, usuarioActual } from "@/lib/usuarios";

export const metadata = metadataDePagina({
  titulo: "Entrá a tu cuenta",
  descripcion: "Entrá a AlquiloPinamar con un link a tu mail, sin contraseñas.",
  ruta: "/cuenta/ingresar",
  noIndexar: true,
});

const ERRORES: Record<string, string> = {
  sesion: "Tu sesión se cerró. Volvé a entrar.",
};

export default async function IngresarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const volver = rutaVolver(typeof sp.volver === "string" ? sp.volver : undefined);
  if (await usuarioActual()) redirect(volver);
  const error = typeof sp.error === "string" ? (ERRORES[sp.error] ?? null) : null;
  return <PedirLink volver={volver} error={error} />;
}
