"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Logo from "@/components/site/Logo";
import { cn } from "@/lib/cn";

const SECCIONES = [
  { href: "/admin", etiqueta: "Inicio" },
  { href: "/admin/propiedades", etiqueta: "Propiedades" },
  { href: "/admin/consultas", etiqueta: "Consultas" },
  { href: "/admin/zonas", etiqueta: "Zonas" },
  { href: "/admin/amenities", etiqueta: "Amenities" },
];

// Barra de arriba del admin: secciones en pastillas (se deslizan de costado en el celular) y salir.
export default function AdminNav({ nombre, consultasNuevas }: { nombre: string; consultasNuevas: number }) {
  const pathname = usePathname();
  return (
    <header className="vidrio-header sticky top-0 z-50 border-b border-gris-200">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 md:px-8">
        <Link href="/admin" className="flex shrink-0 items-center gap-2 font-titulo text-[16px] font-semibold tracking-[-0.02em]">
          <Logo pieza="isotipo" alto={26} />
          Admin
        </Link>
        <nav
          aria-label="Secciones del admin"
          className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECCIONES.map((s) => {
            const activa = s.href === "/admin" ? pathname === "/admin" : pathname.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "flex h-9 shrink-0 items-center rounded-pastilla px-3.5 text-[13px] font-medium transition-colors duration-200",
                  activa ? "bg-negro text-blanco" : "text-negro hover:bg-gris-100",
                )}
              >
                {s.etiqueta}
                {s.href === "/admin/consultas" && consultasNuevas > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-pastilla px-1 text-[11px] leading-none font-semibold tabular-nums",
                      activa ? "bg-blanco text-negro" : "bg-negro text-blanco",
                    )}
                  >
                    {consultasNuevas > 99 ? "99+" : consultasNuevas}
                    <span className="sr-only">{consultasNuevas === 1 ? " nueva" : " nuevas"}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <span className="hidden text-[13px] text-texto-2 md:inline">{nombre}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="shrink-0 text-[13px] text-link"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
