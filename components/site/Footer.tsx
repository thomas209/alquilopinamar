import Link from "next/link";
import Rotulo from "@/components/ui/Rotulo";
import { OPERACIONES_URL } from "@/lib/busqueda";
import { EMPRESA } from "@/lib/empresa";
import { zonasActivas } from "@/lib/sitio";

const SITIO = [
  { href: "/nosotros", etiqueta: "Quiénes somos" },
  { href: "/contacto", etiqueta: "Contacto" },
  { href: "/contacto#publicar", etiqueta: "Publicá tu propiedad" },
];

const LEGALES = [
  { href: "/terminos", etiqueta: "Términos y condiciones" },
  { href: "/privacidad", etiqueta: "Privacidad" },
];

function Columna({ titulo, links }: { titulo: string; links: { href: string; etiqueta: string }[] }) {
  return (
    <div>
      <Rotulo como="p">{titulo}</Rotulo>
      <ul className="mt-4 space-y-2.5 text-[15px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-opacity hover:opacity-60">
              {l.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const zonas = await zonasActivas();
  return (
    <footer className="mt-20 border-t border-gris-200 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-12 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <p className="font-titulo text-[19px] font-semibold tracking-[-0.02em]">{EMPRESA.nombre}</p>
          <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-texto-2">Alquiler temporario, alquiler anual y venta de propiedades en Pinamar y alrededores.</p>
          {EMPRESA.instagram && (
            <a href={"https://instagram.com/" + EMPRESA.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[14px] text-link">
              @{EMPRESA.instagram}
            </a>
          )}
        </div>
        <Columna titulo="Zonas" links={zonas.map((z) => ({ href: "/zonas/" + z.slug, etiqueta: z.name }))} />
        <Columna titulo="Buscar" links={OPERACIONES_URL.map((o) => ({ href: "/propiedades?operacion=" + o.url, etiqueta: o.titulo }))} />
        <Columna titulo="AlquiloPinamar" links={SITIO} />
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-gris-200 px-4 py-6 text-[13px] text-texto-2 md:flex-row md:items-center md:justify-between md:px-12">
        <p>
          © {new Date().getFullYear()} {EMPRESA.nombre}
        </p>
        <nav aria-label="Legales" className="flex gap-5">
          {LEGALES.map((l) => (
            <Link key={l.href} href={l.href} className="transition-opacity hover:opacity-60">
              {l.etiqueta}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
