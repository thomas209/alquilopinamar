import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/site/Header";
import PanelNav from "@/components/panel/PanelNav";
import { usuarioActual } from "@/lib/usuarios";

// El panel siempre se arma en el momento (nunca desde cache).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel | AlquiloPinamar" },
  robots: { index: false, follow: false },
};

// Panel del propietario. El proxy ya pide sesion; aca se vuelve a leer el
// usuario de la base (si esta bloqueado o la cookie es vieja, vuelve a entrar).
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const yo = await usuarioActual();
  if (!yo) redirect("/cuenta/ingresar?volver=/panel/propiedades");
  return (
    <>
      <Header />
      <PanelNav />
      <main>{children}</main>
    </>
  );
}
