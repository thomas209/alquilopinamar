import ConfirmarIngreso from "@/components/cuenta/ConfirmarIngreso";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Entrar a tu cuenta",
  descripcion: "Confirmá el ingreso a tu cuenta de AlquiloPinamar.",
  ruta: "/ingresar/confirmar",
  noIndexar: true,
});

type Props = { searchParams: Promise<{ t?: string }> };

// Se llega desde el boton del mail. No usa el link al abrir (los antivirus del
// correo abren los links solos): lo usa el boton "Entrar".
export default async function ConfirmarPage({ searchParams }: Props) {
  const { t } = await searchParams;
  return <ConfirmarIngreso token={typeof t === "string" ? t.slice(0, 100) : ""} />;
}
