import Link from "next/link";
import Rotulo from "@/components/ui/Rotulo";
import { OPERACIONES_URL } from "@/lib/busqueda";
import { zonasActivas } from "@/lib/sitio";

export default async function Footer() {
  const zonas = await zonasActivas();
  return (
    <footer className="mt-20 border-t border-gris-200">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-3 md:px-12">
        <div>
          <p className="font-titulo text-[19px] font-semibold tracking-[-0.02em]">AlquiloPinamar</p>
          <p className="mt-2 max-w-[36ch] text-[14px] text-texto-2">Alquiler temporario, alquiler anual y venta de propiedades en Pinamar y alrededores.</p>
        </div>
        <div>
          <Rotulo como="p">Zonas</Rotulo>
          <ul className="mt-4 space-y-2 text-[15px]">
            {zonas.map((z) => (
              <li key={z.slug}>
                <Link href={"/zonas/" + z.slug} className="hover:opacity-70">
                  {z.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Rotulo como="p">Buscar</Rotulo>
          <ul className="mt-4 space-y-2 text-[15px]">
            {OPERACIONES_URL.map((o) => (
              <li key={o.url}>
                <Link href={"/propiedades?operacion=" + o.url} className="hover:opacity-70">
                  {o.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
