"use client";
import { createContext, use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Hoja from "@/components/ui/Hoja";
import Icono from "@/components/ui/Icono";
import { PastillaFiltro } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import Segmentado from "@/components/ui/Segmentado";
import { TIPOS } from "@/lib/etiquetas";
import { DISTANCIAS_MAR, filtrosExtra, OPERACIONES_URL, ORDENES, POR_TANDA, urlDeBusqueda, type Busqueda } from "@/lib/busqueda";
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
type Opcion = { slug: string; name: string };

export function Filtros({ busqueda, zonas, comodidades }: { busqueda: Busqueda; zonas: Opcion[]; comodidades: Opcion[] }) {
  const { ir } = use(Navegacion);
  // Al cambiar un filtro se vuelve a la primera tanda
  const cambiar = (cambio: Partial<Busqueda>) => ir(urlDeBusqueda({ ...busqueda, ver: 0, ...cambio }));
  const activos = [busqueda.zona, busqueda.tipo, busqueda.dorm, busqueda.pileta, busqueda.mascotas].filter(Boolean).length + filtrosExtra(busqueda);

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
        <MasFiltros busqueda={busqueda} comodidades={comodidades} onAplicar={cambiar} />
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

type Extra = Pick<Busqueda, "moneda" | "pmin" | "pmax" | "banos" | "cochera" | "mar" | "com">;
const SIN_EXTRA: Extra = { moneda: "", pmin: "", pmax: "", banos: "", cochera: false, mar: "", com: [] };
const soloDigitos = (v: string) => v.replace(/\D/g, "").slice(0, 12).replace(/^0+/, "");
const conPuntos = (v: string) => (v ? Number(v).toLocaleString("es-AR") : "");

// Pastilla "Más filtros" + hoja con precio, baños, cochera, distancia al mar y comodidades.
// Los cambios se aplican recien al tocar "Ver resultados".
function MasFiltros({ busqueda, comodidades, onAplicar }: { busqueda: Busqueda; comodidades: Opcion[]; onAplicar: (cambio: Partial<Busqueda>) => void }) {
  const [abierta, setAbierta] = useState(false);
  const [borrador, setBorrador] = useState<Extra>(SIN_EXTRA);
  const cantidad = filtrosExtra(busqueda);
  const poner = (cambio: Partial<Extra>) => setBorrador((b) => ({ ...b, ...cambio }));

  const abrir = () => {
    const { moneda, pmin, pmax, banos, cochera, mar, com } = busqueda;
    setBorrador({ moneda: moneda || (pmin || pmax ? "usd" : ""), pmin, pmax, banos, cochera, mar, com });
    setAbierta(true);
  };
  const aplicar = () => {
    let { pmin, pmax } = borrador;
    if (pmin && pmax && Number(pmin) > Number(pmax)) [pmin, pmax] = [pmax, pmin];
    // Sin moneda no se puede filtrar por precio: se toma USD
    const moneda = borrador.moneda || (pmin || pmax ? "usd" : "");
    onAplicar({ ...borrador, moneda, pmin, pmax });
    setAbierta(false);
  };
  const alternarComodidad = (slug: string) => poner({ com: borrador.com.includes(slug) ? borrador.com.filter((c) => c !== slug) : [...borrador.com, slug] });

  return (
    <>
      <PastillaFiltro activa={cantidad > 0} onClick={abrir} className="shrink-0">
        <Icono nombre="filtros" tamano={16} />
        Más filtros
        {cantidad > 0 && (
          <span className="inline-grid h-5 min-w-5 place-items-center rounded-pastilla bg-blanco px-1.5 text-[11px] leading-none font-semibold text-negro tabular-nums">{cantidad}</span>
        )}
      </PastillaFiltro>

      <Hoja
        abierta={abierta}
        onCerrar={() => setAbierta(false)}
        titulo="Más filtros"
        pie={
          <div className="flex items-center gap-3">
            <Boton variante="texto" onClick={() => setBorrador(SIN_EXTRA)}>
              Limpiar
            </Boton>
            <Boton ancho onClick={aplicar} className="flex-1">
              Ver resultados
            </Boton>
          </div>
        }
      >
        <div className="space-y-8">
          <fieldset>
            <legend className="mb-3">
              <Rotulo>Precio</Rotulo>
            </legend>
            <Segmentado
              etiqueta="Moneda"
              ancho
              opciones={[
                { valor: "", etiqueta: "Cualquiera" },
                { valor: "usd", etiqueta: "Dólares" },
                { valor: "ars", etiqueta: "Pesos" },
              ]}
              valor={borrador.moneda}
              onChange={(v) => poner({ moneda: v as Extra["moneda"], ...(v ? {} : { pmin: "", pmax: "" }) })}
            />
            {borrador.moneda && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Campo etiqueta="Desde" inputMode="numeric" placeholder="Mínimo" value={conPuntos(borrador.pmin)} onChange={(e) => poner({ pmin: soloDigitos(e.target.value) })} />
                <Campo etiqueta="Hasta" inputMode="numeric" placeholder="Máximo" value={conPuntos(borrador.pmax)} onChange={(e) => poner({ pmax: soloDigitos(e.target.value) })} />
              </div>
            )}
            <p className="mt-2 text-[13px] text-texto-2">Cada propiedad publica su precio en su moneda; no se convierten.</p>
          </fieldset>

          <fieldset>
            <legend className="mb-3">
              <Rotulo>Baños</Rotulo>
            </legend>
            <Segmentado
              etiqueta="Baños"
              ancho
              opciones={[{ valor: "", etiqueta: "Todos" }, ...["1", "2", "3"].map((n) => ({ valor: n, etiqueta: n + "+" }))]}
              valor={borrador.banos}
              onChange={(v) => poner({ banos: v })}
            />
          </fieldset>

          <fieldset>
            <legend className="mb-3">
              <Rotulo>Distancia al mar</Rotulo>
            </legend>
            <Segmentado
              etiqueta="Distancia al mar"
              ancho
              opciones={[{ valor: "", etiqueta: "Cualquiera" }, ...DISTANCIAS_MAR.map((d) => ({ valor: d.url as string, etiqueta: "Hasta " + d.etiqueta }))]}
              valor={borrador.mar}
              onChange={(v) => poner({ mar: v })}
            />
          </fieldset>

          <fieldset>
            <legend className="mb-3">
              <Rotulo>Comodidades</Rotulo>
            </legend>
            <div className="flex flex-wrap gap-2">
              <PastillaFiltro activa={borrador.cochera} onClick={() => poner({ cochera: !borrador.cochera })}>
                Cochera
              </PastillaFiltro>
              {comodidades.map((c) => (
                <PastillaFiltro key={c.slug} activa={borrador.com.includes(c.slug)} onClick={() => alternarComodidad(c.slug)}>
                  {c.name}
                </PastillaFiltro>
              ))}
            </div>
          </fieldset>
        </div>
      </Hoja>
    </>
  );
}

// "Ver más": trae la tanda siguiente sin mover la pantalla.
export function VerMas({ busqueda, mostradas, total }: { busqueda: Busqueda; mostradas: number; total: number }) {
  const { ir, pendiente } = use(Navegacion);
  if (mostradas >= total) return null;
  return (
    <div className="mt-12 flex flex-col items-center gap-3 px-4">
      <p className="text-[14px] text-texto-2 tabular-nums">
        Viendo {mostradas} de {total}
      </p>
      <Boton variante="secundario" disabled={pendiente} onClick={() => ir(urlDeBusqueda({ ...busqueda, ver: busqueda.ver + POR_TANDA }))}>
        {pendiente ? "Cargando…" : "Ver más"}
      </Boton>
    </div>
  );
}
