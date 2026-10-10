"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import Icono from "@/components/ui/Icono";
import { Campo, CampoArea, CampoSelect } from "@/components/ui/Campo";
import { PastillaEstado, PastillaFiltro } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import Segmentado from "@/components/ui/Segmentado";
import FotosPropiedad, { type FotoAdmin } from "@/components/admin/FotosPropiedad";
import { MapaElegir } from "@/components/mapa";
import { CENTRO_PARTIDO, CENTRO_ZONA } from "@/lib/mapa-datos";
import {
  ESTADOS,
  MONEDAS,
  OPERACIONES,
  PERIODOS,
  PERIODOS_POR_OPERACION,
  TIPOS,
  type Estado,
  type MonedaPrecio,
  type Operacion,
  type PeriodoPrecio,
  type Tipo,
} from "@/lib/etiquetas";
import { formatearCodigo } from "@/lib/formato";
import { pedir } from "@/lib/pedir";

type Tarifa = {
  label: string;
  period: PeriodoPrecio;
  amount: string;
  currency: MonedaPrecio;
  startDate: string;
  endDate: string;
};

export type ValoresPropiedad = {
  title: string;
  description: string;
  operation: Operacion;
  type: Tipo;
  zoneId: string;
  address: string;
  lat: string;
  lng: string;
  showExactLocation: boolean;
  distanceToSeaM: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  garages: string;
  maxGuests: string;
  coveredM2: string;
  lotM2: string;
  hasPool: boolean;
  petsAllowed: boolean;
  price: string;
  currency: MonedaPrecio;
  pricePeriod: PeriodoPrecio;
  priceOnRequest: boolean;
  expenses: string;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
  minNights: string;
  contactWhatsapp: string;
  isFeatured: boolean;
  featuredOrder: string;
  amenityIds: string[];
  rates: Tarifa[];
};

type Existente = {
  id: string;
  code: number;
  slug: string;
  status: Estado;
  fotos: number;
  imagenes: FotoAdmin[];
  minimoFotos: number;
  falta: string[];
  valores: ValoresPropiedad;
};

const VACIA: ValoresPropiedad = {
  title: "",
  description: "",
  operation: "ALQUILER_TEMPORARIO",
  type: "CASA",
  zoneId: "",
  address: "",
  lat: "",
  lng: "",
  showExactLocation: false,
  distanceToSeaM: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  garages: "",
  maxGuests: "",
  coveredM2: "",
  lotM2: "",
  hasPool: false,
  petsAllowed: false,
  price: "",
  currency: "USD",
  pricePeriod: "NOCHE",
  priceOnRequest: false,
  expenses: "",
  houseRules: "",
  checkInTime: "",
  checkOutTime: "",
  minNights: "",
  contactWhatsapp: "",
  isFeatured: false,
  featuredOrder: "",
  amenityIds: [],
  rates: [],
};

function Bloque({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gris-200 py-8">
      <Rotulo como="p">{titulo}</Rotulo>
      {ayuda && <p className="mt-2 max-w-[60ch] text-[13px] text-texto-2">{ayuda}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Tilde({ marcado, onChange, children }: { marcado: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 py-1 text-[15px]">
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-negro" />
      {children}
    </label>
  );
}

// Formulario de propiedad del admin: sirve para cargar una nueva y para editar.
export default function PropiedadForm({
  zonas,
  amenities,
  propiedad,
}: {
  zonas: { id: string; name: string; slug: string }[];
  amenities: { id: string; name: string }[];
  propiedad: Existente | null;
}) {
  const router = useRouter();
  const [v, setV] = useState<ValoresPropiedad>(propiedad?.valores ?? { ...VACIA, zoneId: zonas[0]?.id ?? "" });
  const punto = v.lat !== "" && v.lng !== "" && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng)) ? { lat: Number(v.lat), lng: Number(v.lng) } : null;
  const centroMapa = CENTRO_ZONA[zonas.find((z) => z.id === v.zoneId)?.slug ?? ""] ?? CENTRO_PARTIDO;
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [confirmarBaja, setConfirmarBaja] = useState(false);
  // Lo ultimo guardado, para avisar si hay cambios sin guardar
  const [guardado, setGuardado] = useState(() => JSON.stringify(v));
  const sinGuardar = propiedad !== null && JSON.stringify(v) !== guardado;

  // Avisa antes de cerrar o recargar la pagina con cambios sin guardar
  useEffect(() => {
    if (!sinGuardar) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [sinGuardar]);

  const set = <K extends keyof ValoresPropiedad>(campo: K, valor: ValoresPropiedad[K]) => {
    setAviso("");
    setV((actual) => ({ ...actual, [campo]: valor }));
  };
  const texto = (campo: keyof ValoresPropiedad) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(campo, e.target.value as never);

  const esTemporario = v.operation === "ALQUILER_TEMPORARIO";
  const esAnual = v.operation === "ALQUILER_ANUAL";
  const periodos = PERIODOS.filter((p) => PERIODOS_POR_OPERACION[v.operation].includes(p.valor));
  const estado = propiedad ? ESTADOS.find((e) => e.valor === propiedad.status) : null;

  function cambiarOperacion(operation: Operacion) {
    setAviso("");
    setV((actual) => ({
      ...actual,
      operation,
      // El periodo del precio depende de la operacion
      pricePeriod: PERIODOS_POR_OPERACION[operation].includes(actual.pricePeriod) ? actual.pricePeriod : PERIODOS_POR_OPERACION[operation][0],
    }));
  }

  const setTarifa = (i: number, cambios: Partial<Tarifa>) =>
    set("rates", v.rates.map((t, j) => (j === i ? { ...t, ...cambios } : t)));

  // Guarda los datos. Devuelve el id de la propiedad, o null si fallo.
  async function guardar(): Promise<string | null> {
    setError("");
    setAviso("");
    const res = propiedad
      ? await pedir<{ id: string }>("/api/admin/propiedades/" + propiedad.id, "PATCH", v)
      : await pedir<{ id: string }>("/api/admin/propiedades", "POST", v);
    if (!res.ok) {
      setError(res.error);
      return null;
    }
    setGuardado(JSON.stringify(v));
    return res.datos.id;
  }

  async function alGuardar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true);
    const id = await guardar();
    setOcupado(false);
    if (!id) return;
    if (propiedad) {
      setAviso("Guardado.");
      router.refresh();
    } else {
      router.push("/admin/propiedades/" + id);
    }
  }

  // Publicar, pausar o volver a borrador. Antes guarda lo que haya en pantalla.
  async function cambiarEstado(status: "PUBLICADA" | "PAUSADA" | "BORRADOR") {
    if (!propiedad) return;
    setOcupado(true);
    const id = await guardar();
    if (id) {
      const res = await pedir("/api/admin/propiedades/" + id + "/estado", "POST", { status });
      if (!res.ok) setError(res.error);
      else setAviso(status === "PUBLICADA" ? "Publicada." : status === "PAUSADA" ? "Pausada." : "Volvió a borrador.");
      router.refresh();
    }
    setOcupado(false);
  }

  async function duplicar() {
    if (!propiedad) return;
    setError("");
    setOcupado(true);
    const res = await pedir<{ id: string }>("/api/admin/propiedades/" + propiedad.id + "/duplicar", "POST");
    setOcupado(false);
    if (!res.ok) return setError(res.error);
    router.push("/admin/propiedades/" + res.datos.id);
  }

  async function darDeBaja() {
    if (!propiedad) return;
    if (!confirmarBaja) return setConfirmarBaja(true);
    setError("");
    setOcupado(true);
    const res = await pedir("/api/admin/propiedades/" + propiedad.id, "DELETE");
    setOcupado(false);
    if (!res.ok) return setError(res.error);
    router.push("/admin/propiedades");
    router.refresh();
  }

  return (
    <form onSubmit={alGuardar} className="mx-auto max-w-[760px] pb-28">
      <Link href="/admin/propiedades" className="text-[13px] text-link">
        ← Propiedades
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3 pb-8">
        <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">
          {propiedad ? formatearCodigo(propiedad.code) : "Nueva propiedad"}
        </h1>
        {estado && <PastillaEstado tono={estado.tono}>{estado.etiqueta}</PastillaEstado>}
      </div>

      <Bloque titulo="Qué es">
        <div className="flex flex-col gap-4">
          <Segmentado
            etiqueta="Operación"
            valor={v.operation}
            onChange={cambiarOperacion}
            opciones={OPERACIONES.map((o) => ({ valor: o.valor, etiqueta: o.corta }))}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <CampoSelect etiqueta="Tipo de propiedad" value={v.type} onChange={texto("type")}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </CampoSelect>
            <CampoSelect etiqueta="Zona" value={v.zoneId} onChange={texto("zoneId")} required>
              {zonas.length === 0 && <option value="">No hay zonas cargadas</option>}
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </CampoSelect>
          </div>
        </div>
      </Bloque>

      <Bloque titulo="Título y descripción">
        <div className="flex flex-col gap-4">
          <Campo etiqueta="Título" value={v.title} onChange={texto("title")} required maxLength={120} placeholder="Casa en el bosque a 300 m del mar" />
          <CampoArea
            etiqueta="Descripción"
            value={v.description}
            onChange={texto("description")}
            rows={8}
            ayuda={v.description.trim().length + " caracteres (mínimo 100 para publicar). Sin teléfonos, mails ni links."}
          />
        </div>
      </Bloque>

      <Bloque titulo="Ubicación" ayuda="La dirección es privada: no aparece en la ficha. El mapa muestra una zona aproximada, salvo que marques el punto exacto.">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo className="md:col-span-2" etiqueta="Dirección" value={v.address} onChange={texto("address")} maxLength={200} placeholder="Calle y número" />
          <div className="md:col-span-2">
            <div className="mb-[7px] flex items-baseline justify-between gap-3">
              <Rotulo>Punto en el mapa</Rotulo>
              {punto ? (
                <button type="button" onClick={() => setV((x) => ({ ...x, lat: "", lng: "" }))} className="text-[13px] text-link">
                  Quitar punto
                </button>
              ) : (
                <span className="text-[13px] text-texto-2">Tocá el mapa para marcarlo</span>
              )}
            </div>
            <div className="relative isolate h-[340px] overflow-hidden rounded-card border border-gris-200 md:h-[400px]">
              <MapaElegir valor={punto} centro={centroMapa} onChange={(p) => setV((x) => ({ ...x, lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) }))} />
            </div>
            <p className="mt-1.5 text-[13px] text-texto-2">
              {punto ? "Podés arrastrar el punto para ajustarlo. " + punto.lat.toFixed(5) + ", " + punto.lng.toFixed(5) : "Sin punto, la ficha no muestra mapa."}
            </p>
          </div>
          <Campo etiqueta="Distancia al mar (metros)" value={v.distanceToSeaM} onChange={texto("distanceToSeaM")} type="number" min={0} />
          <div className="flex items-end">
            <Tilde marcado={v.showExactLocation} onChange={(x) => set("showExactLocation", x)}>
              Mostrar el punto exacto en el mapa
            </Tilde>
          </div>
        </div>
      </Bloque>

      <Bloque titulo="Características">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Campo etiqueta="Ambientes" value={v.rooms} onChange={texto("rooms")} type="number" min={0} />
          <Campo etiqueta="Dormitorios" value={v.bedrooms} onChange={texto("bedrooms")} type="number" min={0} />
          <Campo etiqueta="Baños" value={v.bathrooms} onChange={texto("bathrooms")} type="number" min={0} />
          <Campo etiqueta="Cocheras" value={v.garages} onChange={texto("garages")} type="number" min={0} />
          <Campo etiqueta="Huéspedes" value={v.maxGuests} onChange={texto("maxGuests")} type="number" min={0} />
          <Campo etiqueta="M² cubiertos" value={v.coveredM2} onChange={texto("coveredM2")} type="number" min={0} />
          <Campo etiqueta="M² de lote" value={v.lotM2} onChange={texto("lotM2")} type="number" min={0} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1">
          <Tilde marcado={v.hasPool} onChange={(x) => set("hasPool", x)}>
            Tiene pileta
          </Tilde>
          <Tilde marcado={v.petsAllowed} onChange={(x) => set("petsAllowed", x)}>
            Acepta mascotas
          </Tilde>
        </div>
      </Bloque>

      <Bloque titulo="Amenities">
        {amenities.length === 0 ? (
          <p className="text-[14px] text-texto-2">No hay amenities cargados.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const activa = v.amenityIds.includes(a.id);
              return (
                <PastillaFiltro
                  key={a.id}
                  activa={activa}
                  onClick={() => set("amenityIds", activa ? v.amenityIds.filter((x) => x !== a.id) : [...v.amenityIds, a.id])}
                >
                  {a.name}
                </PastillaFiltro>
              );
            })}
          </div>
        )}
      </Bloque>

      <Bloque titulo="Precio" ayuda="Es el precio que se ve en el listado y por el que se ordena.">
        <div className="grid gap-4 md:grid-cols-3">
          <CampoSelect etiqueta="Moneda" value={v.currency} onChange={texto("currency")}>
            {MONEDAS.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.etiqueta}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Precio" value={v.price} onChange={texto("price")} type="number" min={0} step="any" disabled={v.priceOnRequest} />
          <CampoSelect etiqueta="Período" value={v.pricePeriod} onChange={texto("pricePeriod")} disabled={periodos.length === 1}>
            {periodos.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta}
              </option>
            ))}
          </CampoSelect>
          {esAnual && <Campo etiqueta="Expensas (por mes)" value={v.expenses} onChange={texto("expenses")} type="number" min={0} step="any" />}
        </div>
        <div className="mt-3">
          <Tilde marcado={v.priceOnRequest} onChange={(x) => set("priceOnRequest", x)}>
            No mostrar precio (dice “Consultar”)
          </Tilde>
        </div>
      </Bloque>

      {esTemporario && (
        <Bloque titulo="Tarifas por período" ayuda="Opcional. Se muestran como tabla en la ficha: quincenas de enero, temporada baja, fines de semana largos, etc.">
          <div className="flex flex-col gap-4">
            {v.rates.map((t, i) => (
              <div key={i} className="rounded-[22px] bg-gris-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Campo className="md:col-span-2" etiqueta="Nombre" value={t.label} onChange={(e) => setTarifa(i, { label: e.target.value })} maxLength={80} placeholder="Enero · 1ra quincena" />
                  <Campo etiqueta="Precio" value={t.amount} onChange={(e) => setTarifa(i, { amount: e.target.value })} type="number" min={0} step="any" />
                  <CampoSelect etiqueta="Período" value={t.period} onChange={(e) => setTarifa(i, { period: e.target.value as PeriodoPrecio })}>
                    {periodos.map((p) => (
                      <option key={p.valor} value={p.valor}>
                        {p.etiqueta}
                      </option>
                    ))}
                  </CampoSelect>
                  <Campo etiqueta="Desde (opcional)" value={t.startDate} onChange={(e) => setTarifa(i, { startDate: e.target.value })} type="date" />
                  <Campo etiqueta="Hasta (opcional)" value={t.endDate} onChange={(e) => setTarifa(i, { endDate: e.target.value })} type="date" />
                </div>
                <Boton variante="texto" className="mt-2 text-error" onClick={() => set("rates", v.rates.filter((_, j) => j !== i))}>
                  Quitar tarifa
                </Boton>
              </div>
            ))}
            <div>
              <Boton
                variante="secundario"
                tamano="chico"
                disabled={v.rates.length >= 30}
                onClick={() => set("rates", [...v.rates, { label: "", period: v.pricePeriod, amount: "", currency: v.currency, startDate: "", endDate: "" }])}
              >
                Agregar tarifa
              </Boton>
            </div>
          </div>
        </Bloque>
      )}

      <Bloque titulo={esTemporario ? "Estadía y reglas" : "Condiciones"}>
        <div className="grid gap-4 md:grid-cols-3">
          {esTemporario && (
            <>
              <Campo etiqueta="Entrada" value={v.checkInTime} onChange={texto("checkInTime")} type="time" />
              <Campo etiqueta="Salida" value={v.checkOutTime} onChange={texto("checkOutTime")} type="time" />
              <Campo etiqueta="Noches mínimas" value={v.minNights} onChange={texto("minNights")} type="number" min={0} />
            </>
          )}
          <CampoArea
            className="md:col-span-3"
            etiqueta={esTemporario ? "Reglas de la casa" : "Condiciones y aclaraciones"}
            value={v.houseRules}
            onChange={texto("houseRules")}
            rows={4}
          />
        </div>
      </Bloque>

      <Bloque titulo="Contacto y destacado">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo
            etiqueta="WhatsApp de esta propiedad"
            value={v.contactWhatsapp}
            onChange={texto("contactWhatsapp")}
            type="tel"
            maxLength={30}
            ayuda="Si lo dejás vacío se usa el WhatsApp del sitio."
          />
          {v.isFeatured && (
            <Campo etiqueta="Orden entre destacadas" value={v.featuredOrder} onChange={texto("featuredOrder")} type="number" min={0} ayuda="Las de número más chico van primero." />
          )}
        </div>
        <div className="mt-3">
          <Tilde marcado={v.isFeatured} onChange={(x) => set("isFeatured", x)}>
            Destacada (aparece primero en la home y en los listados)
          </Tilde>
        </div>
      </Bloque>

      <Bloque titulo="Fotos">
        {propiedad ? (
          <FotosPropiedad propiedadId={propiedad.id} iniciales={propiedad.imagenes} minimo={propiedad.minimoFotos} />
        ) : (
          <p className="max-w-[60ch] text-[14px] text-texto-2">Primero creá el borrador. Después se habilita la subida de fotos.</p>
        )}
      </Bloque>

      {propiedad && (
        <Bloque titulo="Publicación">
          {propiedad.falta.length > 0 && propiedad.status !== "PUBLICADA" && (
            <div className="mb-5 rounded-[22px] bg-gris-50 p-4 text-[14px]">
              <p className="font-medium">Para publicarla falta:</p>
              <ul className="mt-2 list-disc pl-5 text-texto-2">
                {propiedad.falta.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {propiedad.status !== "PUBLICADA" && (
              <Boton tamano="chico" disabled={ocupado} onClick={() => cambiarEstado("PUBLICADA")}>
                Guardar y publicar
              </Boton>
            )}
            {propiedad.status === "PUBLICADA" && (
              <Boton variante="secundario" tamano="chico" disabled={ocupado} onClick={() => cambiarEstado("PAUSADA")}>
                Pausar
              </Boton>
            )}
            {propiedad.status !== "BORRADOR" && propiedad.status !== "PUBLICADA" && (
              <Boton variante="secundario" tamano="chico" disabled={ocupado} onClick={() => cambiarEstado("BORRADOR")}>
                Volver a borrador
              </Boton>
            )}
            <Boton variante="secundario" tamano="chico" disabled={ocupado} onClick={duplicar}>
              Duplicar
            </Boton>
            <Boton variante="texto" className="!text-error" disabled={ocupado} onClick={darDeBaja}>
              {confirmarBaja ? "¿Seguro? Tocá de nuevo para dar de baja" : "Dar de baja"}
            </Boton>
          </div>
          <p className="mt-3 text-[13px] text-texto-2">“Duplicar” crea una copia en borrador, sin fotos, para publicarla con otra operación.</p>
        </Bloque>
      )}

      {/* Barra fija de abajo: guardar siempre a mano */}
      <div className="vidrio-barra fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-[760px] items-center gap-4">
          <p role="status" className={"flex min-w-0 flex-1 items-center gap-1.5 text-[13px] " + (error ? "text-error" : sinGuardar ? "text-negro" : aviso ? "text-ok" : "text-texto-2")}>
            {error ? (
              error
            ) : sinGuardar ? (
              <>
                <span className="size-2 shrink-0 rounded-full bg-negro" aria-hidden="true" />
                Hay cambios sin guardar
              </>
            ) : aviso ? (
              <>
                <Icono nombre="check" tamano={16} />
                {aviso === "Guardado." ? "Cambios guardados" : aviso}
              </>
            ) : null}
          </p>
          <Boton type="submit" disabled={ocupado}>
            {ocupado ? "Guardando…" : propiedad ? "Guardar" : "Crear borrador"}
          </Boton>
        </div>
      </div>
    </form>
  );
}
