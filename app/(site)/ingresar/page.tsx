import { redirect } from "next/navigation";
import FormIngresar from "@/components/cuenta/FormIngresar";
import { metadataDePagina } from "@/lib/seo";
import { rutaVolver, usuarioActual } from "@/lib/usuarios";

export const metadata = metadataDePagina({
  titulo: "Ingresar",
  descripcion: "Entrá a tu cuenta de AlquiloPinamar con tu mail, sin contraseña.",
  ruta: "/ingresar",
  noIndexar: true,
});

type Props = { searchParams: Promise<{ volver?: string; error?: string }> };

export default async function IngresarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const volver = rutaVolver(sp.volver) ?? "/cuenta";
  if (await usuarioActual()) redirect(volver);
  return <FormIngresar volver={volver} />;
}
