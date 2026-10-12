"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const SECCIONES = [
  { href: "/panel/propiedades", etiqueta: "Mis propiedades" },
  { href: "/cuenta", etiqueta: "Mi cuenta" },
];

// Secciones del panel del propietario, debajo del header del sitio.
export default function PanelNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 pt-6 md:px-12">
      {SECCIONES.map((s) => {
        const activa = pathname.startsWith(s.href);
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-pastilla px-4 text-[14px] font-medium transition-colors duration-200",
              activa ? "bg-negro text-blanco" : "bg-gris-100 text-negro hover:bg-gris-200",
            )}
          >
            {s.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
