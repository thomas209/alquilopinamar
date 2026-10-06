"use client";
import { createContext, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icono from "@/components/ui/Icono";
import { PastillaFiltro } from "@/components/ui/Pastilla";
import Segmentado from "@/components/ui/Segmentado";
import { TIPOS } from "@/lib/etiquetas";
import { OPERACIONES_URL, ORDENES, urlDeBusqueda, type Busqueda } from "@/lib/busqueda";
import { cn } from "@/lib/cn";

const Navegacion = createContext<{ ir: (href: string) => void; pendiente: boolean }>({ ir: () => {}, pendiente: false });

// Envuelve el listado: al cambiar un filtro no recarga la pagina,
// atenua los resultados actuales mientras llegan los nuevos.
export function MarcoListado({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const ir = (href: string) => empezar(() => router.push(href, { scroll: false }));
  return <Navegacion value={{ ir, pendiente }}>{children}</Navegacion>;
}

export function Atenuable({ children }: { children: React.ReactNode }) {
  const { pendiente } = use(Navegacion);
  return (
    <div aria-busy={pendiente} className={cn("transition-opacity duration-200 ease-app", pendiente && "opacity-40")}>
      {children}
    </div>
  );
}

// Desplegable con forma de pastilla. Usa el selector nativo del telefono.
function SelectPastilla({ etiqueta, valor, opciones, onChange }: { etiqueta: string; valor: string; opciones: { valor: string; etiqueta: string }[]; onChange: (v: string) => void }) {
  const elegida = opciones.find((o) => o.valor === valor && o.valor !== "");
  return (
    <label
      className={cn(
        "relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pastilla pr-3.5 pl-[18px] text-[14px] font-medium whitespace-nowrap transition-colors duration-200",
        elegida ? "bg-negro text-blanco" : "bg-gris-100 text-negro hover:bg-gris-200",
      )}
    >
      {elegida ? elegida.etiqueta : etiqueta}
      <Icono nombre="flecha-abajo" tamano={16} />
      <select aria-label={etiqueta} value={valor} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer appearance-none text-[16px] text-negro opacity-0">
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.valor === "" ? etiqueta + ": " + o.etiqueta.toLowerCase() : o.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

// Filtros del listado. Cada cambio va a la URL, asi la busqueda se puede compartir.
export function Filtros({ busqueda, zonas }: { busqueda: Busqueda; zonas: { slug: string; name: string }[] }) {
  const { ir } = use(Navegacion);
  const cambiar = (cambio: Partial<Busqueda>) => ir(urlDeBusqueda({ ...busqueda, ...cambio }));
  const activos = [busqueda.zona, busqueda.tipo, busqueda.dorm, busqueda.pileta, busqueda.mascotas].filter(Boolean).length;

  return (
    <div>
      <Segmentado
        etiqueta="Operación"
        ancho
        className="md:hidden"
        opciones={[{ valor: "", etiqueta: "Todas" }, ...OPERACIONES_URL.map((o) => ({ valor: o.url as string, etiqueta: o.etiqueta as string }))]}
        valor={busqueda.operacion as string}
        onChange={(v) => cambiar({ operacion: v as Busqueda["operacion"] })}
      />
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mt-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        <SelectPastilla etiqueta="Zona" valor={busqueda.zona} onChange={(v) => cambiar({ zona: v })} opciones={[{ valor: "", etiqueta: "Todas" }, ...zonas.map((z) => ({ valor: z.slug, etiqueta: z.name }))]} />
        <SelectPastilla
          etiqueta="Tipo"
          valor={busqueda.tipo}
          onChange={(v) => cambiar({ tipo: v })}
          opciones={[{ valor: "", etiqueta: "Todos" }, ...TIPOS.map((t) => ({ valor: t.valor.toLowerCase(), etiqueta: t.etiqueta }))]}
        />
        <SelectPastilla
          etiqueta="Dormitorios"
          valor={busqueda.dorm}
          onChange={(v) => cambiar({ dorm: v })}
          opciones={[{ valor: "", etiqueta: "Todos" }, ...["1", "2", "3", "4"].map((n) => ({ valor: n, etiqueta: n + "+ dorm." }))]}
        />
        <PastillaFiltro activa={busqueda.pileta} onClick={() => cambiar({ pileta: !busqueda.pileta })} className="shrink-0">
          Pileta
        </PastillaFiltro>
        <PastillaFiltro activa={busqueda.mascotas} onClick={() => cambiar({ mascotas: !busqueda.mascotas })} className="shrink-0">
          Mascotas
        </PastillaFiltro>
        <SelectPastilla etiqueta="Orden" valor={busqueda.orden} onChange={(v) => cambiar({ orden: v })} opciones={ORDENES.map((o) => ({ valor: o.url as string, etiqueta: o.etiqueta as string }))} />
        {activos > 0 && (
          <button type="button" onClick={() => ir(urlDeBusqueda({ operacion: busqueda.operacion, orden: busqueda.orden }))} className="h-11 shrink-0 px-2 text-[14px] text-link">
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

// Boton de "limpiar filtros" para la pantalla sin resultados.
export function LimpiarFiltros() {
  const { ir } = use(Navegacion);
  return (
    <button type="button" onClick={() => ir("/propiedades")} className="mt-5 inline-flex h-11 items-center rounded-pastilla bg-negro px-5 text-[14px] font-medium text-blanco active:scale-[0.97]">
      Ver todas las propiedades
    </button>
  );
}
