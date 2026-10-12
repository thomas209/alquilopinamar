"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FotosPropiedad, { type FotoAdmin } from "@/components/admin/FotosPropiedad";
import { MapaElegir } from "@/components/mapa";
import Boton from "@/components/ui/Boton";
import { Campo, CampoArea, CampoSelect } from "@/components/ui/Campo";
import Icono from "@/components/ui/Icono";
import { PastillaFiltro } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import Segmentado from "@/components/ui/Segmentado";
import { cn } from "@/lib/cn";
import { MONEDAS, OPERACIONES, PERIODOS, PERIODOS_POR_OPERACION, TIPOS, type Estado, type Operacion } from "@/lib/etiquetas";
import { formatearCodigo } from "@/lib/formato";
import { miniatura } from "@/lib/foto";
import { CENTRO_PARTIDO, CENTRO_ZONA } from "@/lib/mapa-datos";
import { pedir } from "@/lib/pedir";
import { faltaParaPublicar, MIN_DESCRIPCION, minimoDeFotos } from "@/lib/requisitos";
import type { ValoresPropiedad } from "@/lib/valores-propiedad";
import EditorPeriodos from "@/components/panel/EditorPeriodos";
import CalendarioOcupado from "@/components/panel/CalendarioOcupado";
import { guardarOcupadosEn } from "@/components/panel/DisponibilidadRapida";
import type { Rango } from "@/lib/disponibilidad";

const API = "/api/panel/propiedades/";

// Un paso por pantalla (docs/04-ux-ui.md → Panel del propietario)
const PASOS = [
  { id: "que", corto: "Qué", titulo: "¿Qué querés publicar?", bajada: "Elegí la operación, el tipo de propiedad y la zona." },
  { id: "descripcion", corto: "Descripción", titulo: "Contanos cómo es", bajada: "Un buen título y una descripción completa hacen la diferencia." },
  { id: "caracteristicas", corto: "Características", titulo: "Características", bajada: "Completá lo que corresponda. Lo que no aplique, dejalo vacío." },
  { id: "ubicacion", corto: "Ubicación", titulo: "¿Dónde está?", bajada: "La dirección es privada: nunca se muestra. En el mapa se ve una zona aproximada, salvo que elijas mostrar el punto exacto." },
  { id: "fotos", corto: "Fotos", titulo: "Fotos", bajada: "Las fotos son lo primero que se mira. Subilas en la mejor calidad que tengas: horizontales, con luz natural." },
  { id: "comodidades", corto: "Comodidades", titulo: "Comodidades", bajada: "Marcá todo lo que tiene. Se usan en los filtros de búsqueda." },
  { id: "precio", corto: "Precio", titulo: "Precio", bajada: "Es el que se ve en el listado y por el que se ordena." },
  { id: "disponibilidad", corto: "Disponibilidad", titulo: "Disponibilidad", bajada: "Marcá las fechas que ya están alquiladas. Las noches que queden libres se ven en la publicación con su precio por noche." },
  { id: "reglas", corto: "Reglas", titulo: "Reglas y contacto", bajada: "Condiciones de la estadía y el WhatsApp donde te van a escribir." },
  { id: "revision", corto: "Revisión", titulo: "Revisá y enviá", bajada: "" },
] as const;

type Zona = { id: string; name: string; slug: string };
type Amenity = { id: string; name: string };

export type PropiedadPanel = {
  id: string;
  code: number;
  slug: string;
  status: Estado;
  rejectionReason: string | null;
  needsReview: boolean;
  publishedAt: string | null;
  imagenes: FotoAdmin[];
  valores: ValoresPropiedad;
};

const n = (x: string) => (x === "" ? null : Number(x));

function Tilde({ marcado, onChange, children }: { marcado: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[16px]">
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-negro" />
      {children}
    </label>
  );
}

// Asistente para publicar o editar una propiedad desde el panel del propietario.
// Se guarda como borrador al pasar de paso (desde que tiene titulo y zona).
export default function Asistente({
  zonas,
  amenities,
  propiedad,
  pasoInicial,
  faltaCuenta,
  inicial,
  ocupados = [],
}: {
  zonas: Zona[];
  amenities: Amenity[];
  propiedad: PropiedadPanel | null;
  pasoInicial: number | "fotos" | "revision"; // numero de paso (desde 0) o el id de un paso
  faltaCuenta: string[];
  inicial: ValoresPropiedad;
  ocupados?: Rango[];
}) {
  const router = useRouter();
  const [v, setV] = useState<ValoresPropiedad>(propiedad?.valores ?? inicial);
  const [id, setId] = useState<string | null>(propiedad?.id ?? null);
  const [code, setCode] = useState<number | null>(propiedad?.code ?? null);
  // La disponibilidad aplica solo a alquiler temporario
  const pasos = PASOS.filter((p) => p.id !== "disponibilidad" || v.operation === "ALQUILER_TEMPORARIO");
  const [paso, setPasoCrudo] = useState(() => {
    if (!propiedad) return 0;
    const lista = PASOS.filter((p) => p.id !== "disponibilidad" || propiedad.valores.operation === "ALQUILER_TEMPORARIO");
    if (typeof pasoInicial === "string") return lista.findIndex((p) => p.id === pasoInicial);
    return Math.min(Math.max(pasoInicial, 0), lista.length - 1);
  });
  const setPaso = (i: number) => setPasoCrudo(Math.min(Math.max(i, 0), pasos.length - 1));
  const [guardado, setGuardado] = useState(() => JSON.stringify(propiedad?.valores ?? null));
  // Las fotos se recuerdan aca: el paso de fotos se desmonta al cambiar de paso
  const [imagenes, setImagenes] = useState<FotoAdmin[]>(propiedad?.imagenes ?? []);
  const fotos = imagenes.length;
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const arriba = useRef<HTMLDivElement>(null);

  const sinGuardar = JSON.stringify(v) !== guardado;
  const esTemporario = v.operation === "ALQUILER_TEMPORARIO";
  const esLote = v.type === "LOTE";
  const periodos = PERIODOS.filter((p) => PERIODOS_POR_OPERACION[v.operation].includes(p.valor));
  const punto = v.lat !== "" && v.lng !== "" && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng)) ? { lat: Number(v.lat), lng: Number(v.lng) } : null;
  const centroMapa = CENTRO_ZONA[zonas.find((z) => z.id === v.zoneId)?.slug ?? ""] ?? CENTRO_PARTIDO;
  const publicada = propiedad?.status === "PUBLICADA";

  // Avisa antes de cerrar o recargar con cambios sin guardar
  useEffect(() => {
    if (!sinGuardar || !id) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [sinGuardar, id]);

  const set = <K extends keyof ValoresPropiedad>(campo: K, valor: ValoresPropiedad[K]) => {
    setError("");
    setV((x) => ({ ...x, [campo]: valor }));
  };
  const texto = (campo: keyof ValoresPropiedad) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(campo, e.target.value as never);
  const alCambiarFotos = useCallback((lista: FotoAdmin[]) => setImagenes(lista), []);

  function cambiarOperacion(operation: Operacion) {
    setError("");
    setV((x) => ({
      ...x,
      operation,
      pricePeriod: PERIODOS_POR_OPERACION[operation].includes(x.pricePeriod) ? x.pricePeriod : PERIODOS_POR_OPERACION[operation][0],
    }));
  }

  // Lo minimo de cada paso para poder seguir
  function validarPaso(i: number): string {
    const p = pasos[i].id;
    if (p === "que" && !v.zoneId) return "Elegí la zona.";
    if (p === "descripcion" && v.title.trim().length < 5) return "Poné un título un poco más largo.";
    return "";
  }

  // Guarda en el servidor. La primera vez crea el borrador.
  // Devuelve el id de la propiedad (o "" si todavia no hay), o null si fallo.
  async function guardar(): Promise<string | null> {
    if (id && !sinGuardar) return id;
    if (!id && paso < 1) return ""; // sin titulo todavia no se crea
    const r = id ? await pedir<{ id: string; code: number }>(API + id, "PATCH", v) : await pedir<{ id: string; code: number }>(API.slice(0, -1), "POST", v);
    if (!r.ok) {
      setError(r.error);
      return null;
    }
    setGuardado(JSON.stringify(v));
    if (!id) {
      setId(r.datos.id);
      setCode(r.datos.code);
    }
    return r.datos.id;
  }

  function irA(i: number, nuevoId = id) {
    setPaso(i);
    setError("");
    if (nuevoId) window.history.replaceState(null, "", "/panel/propiedades/" + nuevoId + "?paso=" + (i + 1));
    requestAnimationFrame(() => arriba.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function siguiente() {
    const problema = validarPaso(paso);
    if (problema) return setError(problema);
    setOcupado(true);
    const nuevoId = await guardar();
    setOcupado(false);
    if (nuevoId === null) return;
    irA(paso + 1, nuevoId || null);
  }

  async function atras() {
    if (paso === 0) return;
    if (id && sinGuardar) {
      setOcupado(true);
      const ok = await guardar();
      setOcupado(false);
      if (ok === null) return;
    }
    irA(paso - 1);
  }

  async function saltarA(i: number) {
    if (!id || i === paso) return;
    setOcupado(true);
    const ok = await guardar();
    setOcupado(false);
    if (ok !== null) irA(i);
  }

  async function estado(accion: "enviar" | "retirar" | "pausar" | "reanudar") {
    if (!id) return;
    setOcupado(true);
    const ok = await guardar();
    if (ok !== null) {
      const r = await pedir(API + id + "/estado", "POST", { accion });
      if (!r.ok) setError(r.error);
      else router.refresh();
    }
    setOcupado(false);
  }

  const [confirmarBaja, setConfirmarBaja] = useState(false);
  async function eliminar() {
    if (!id) return;
    if (!confirmarBaja) return setConfirmarBaja(true);
    setOcupado(true);
    const r = await pedir(API + id, "DELETE");
    setOcupado(false);
    if (!r.ok) return setError(r.error);
    router.push("/panel/propiedades");
    router.refresh();
  }

  const falta = faltaParaPublicar({
    title: v.title,
    description: v.description,
    type: v.type,
    operation: v.operation,
    price: v.priceOnRequest ? null : n(v.price),
    priceOnRequest: v.priceOnRequest,
    maxGuests: n(v.maxGuests),
    fotos,
  });
  const actual = pasos[Math.min(paso, pasos.length - 1)];
  const ultimo = paso >= pasos.length - 1;

  return (
    <div className="mx-auto max-w-[760px] px-4 pt-6 pb-36 md:px-0 md:pt-10" ref={arriba}>
      {/* Progreso: tocar un paso lleva ahi (cuando ya hay borrador) */}
      <div className="scroll-mt-24">
        <div className="flex items-center justify-between gap-4">
          <Rotulo>
            {code ? formatearCodigo(code) + " · " : ""}Paso {paso + 1} de {pasos.length}
          </Rotulo>
          <Link href="/panel/propiedades" className="text-[14px] text-link hover:opacity-70">
            {id ? "Guardar y salir" : "Salir"}
          </Link>
        </div>
        <div className="mt-3 flex gap-1" role="list" aria-label="Pasos">
          {pasos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="listitem"
              aria-label={"Paso " + (i + 1) + ": " + p.corto}
              aria-current={i === paso ? "step" : undefined}
              disabled={!id || ocupado}
              onClick={() => saltarA(i)}
              className="group flex-1 py-2 disabled:cursor-default"
            >
              <span className={cn("block h-1 rounded-pastilla transition-colors duration-300", i <= paso ? "bg-negro" : "bg-gris-200", id && "group-hover:bg-gris-400")} />
            </button>
          ))}
        </div>
      </div>

      <header key={actual.id} className="mt-8 animate-entrada">
        <h1 className="font-titulo text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">{actual.titulo}</h1>
        {actual.bajada && <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-texto-2">{actual.bajada}</p>}
      </header>

      <div key={actual.id + "-c"} className="mt-8 animate-entrada">
        {actual.id === "que" && (
          <div className="flex flex-col gap-8">
            <div>
              <Rotulo como="p" className="mb-3">
                Operación
              </Rotulo>
              <Segmentado etiqueta="Operación" valor={v.operation} onChange={cambiarOperacion} ancho opciones={OPERACIONES.map((o) => ({ valor: o.valor, etiqueta: o.corta }))} />
            </div>
            <div>
              <Rotulo como="p" className="mb-3">
                Tipo de propiedad
              </Rotulo>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => (
                  <PastillaFiltro key={t.valor} activa={v.type === t.valor} onClick={() => set("type", t.valor)}>
                    {t.etiqueta}
                  </PastillaFiltro>
                ))}
              </div>
            </div>
            <div>
              <Rotulo como="p" className="mb-3">
                Zona
              </Rotulo>
              <div className="flex flex-wrap gap-2">
                {zonas.map((z) => (
                  <PastillaFiltro key={z.id} activa={v.zoneId === z.id} onClick={() => set("zoneId", z.id)}>
                    {z.name}
                  </PastillaFiltro>
                ))}
              </div>
            </div>
          </div>
        )}

        {actual.id === "descripcion" && (
          <div className="flex flex-col gap-5">
            <Campo etiqueta="Título" value={v.title} onChange={texto("title")} maxLength={120} placeholder="Casa en el bosque a 300 m del mar" autoFocus={!v.title} />
            <CampoArea
              etiqueta="Descripción"
              value={v.description}
              onChange={texto("description")}
              rows={10}
              placeholder="Cómo es la casa, los ambientes, el entorno, qué hay cerca…"
              ayuda={
                v.description.trim().length < MIN_DESCRIPCION
                  ? v.description.trim().length + " de " + MIN_DESCRIPCION + " caracteres como mínimo. Sin teléfonos, mails ni links."
                  : v.description.trim().length + " caracteres. Sin teléfonos, mails ni links."
              }
            />
          </div>
        )}

        {actual.id === "caracteristicas" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {!esLote && (
                <>
                  <Campo etiqueta="Ambientes" value={v.rooms} onChange={texto("rooms")} type="number" inputMode="numeric" min={0} />
                  <Campo etiqueta="Dormitorios" value={v.bedrooms} onChange={texto("bedrooms")} type="number" inputMode="numeric" min={0} />
                  <Campo etiqueta="Baños" value={v.bathrooms} onChange={texto("bathrooms")} type="number" inputMode="numeric" min={0} />
                  <Campo etiqueta="Cocheras" value={v.garages} onChange={texto("garages")} type="number" inputMode="numeric" min={0} />
                  {esTemporario && <Campo etiqueta="Huéspedes (máximo)" value={v.maxGuests} onChange={texto("maxGuests")} type="number" inputMode="numeric" min={0} />}
                  <Campo etiqueta="M² cubiertos" value={v.coveredM2} onChange={texto("coveredM2")} type="number" inputMode="numeric" min={0} />
                </>
              )}
              <Campo etiqueta="M² de lote" value={v.lotM2} onChange={texto("lotM2")} type="number" inputMode="numeric" min={0} />
            </div>
            {!esLote && (
              <div className="flex flex-col">
                <Tilde marcado={v.hasPool} onChange={(x) => set("hasPool", x)}>
                  Tiene pileta
                </Tilde>
                <Tilde marcado={v.petsAllowed} onChange={(x) => set("petsAllowed", x)}>
                  Acepta mascotas
                </Tilde>
              </div>
            )}
          </div>
        )}

        {actual.id === "ubicacion" && (
          <div className="flex flex-col gap-5">
            <Campo etiqueta="Dirección (privada)" value={v.address} onChange={texto("address")} maxLength={200} placeholder="Calle y número" autoComplete="street-address" />
            <div>
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
              <div className="relative isolate h-[360px] overflow-hidden rounded-card border border-gris-200 md:h-[420px]">
                <MapaElegir valor={punto} centro={centroMapa} onChange={(p) => setV((x) => ({ ...x, lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) }))} />
              </div>
              <p className="mt-1.5 text-[13px] text-texto-2">{punto ? "Podés arrastrar el punto para ajustarlo." : "Sin punto, la publicación no muestra mapa ni aparece en la vista de mapa."}</p>
            </div>
            <Tilde marcado={v.showExactLocation} onChange={(x) => set("showExactLocation", x)}>
              Mostrar el punto exacto (si no, se ve una zona aproximada)
            </Tilde>
            <Campo etiqueta="Distancia al mar (metros)" value={v.distanceToSeaM} onChange={texto("distanceToSeaM")} type="number" inputMode="numeric" min={0} className="md:max-w-[50%]" />
          </div>
        )}

        {actual.id === "fotos" &&
          (id ? (
            <FotosPropiedad propiedadId={id} iniciales={imagenes} minimo={minimoDeFotos(v.type)} api={API} onCambio={alCambiarFotos} />
          ) : (
            <p className="text-[15px] text-texto-2">Volvé un paso para crear el borrador.</p>
          ))}

        {actual.id === "comodidades" && (
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const activa = v.amenityIds.includes(a.id);
              return (
                <PastillaFiltro key={a.id} activa={activa} onClick={() => set("amenityIds", activa ? v.amenityIds.filter((x) => x !== a.id) : [...v.amenityIds, a.id])}>
                  {activa && <Icono nombre="check" tamano={16} />}
                  {a.name}
                </PastillaFiltro>
              );
            })}
          </div>
        )}

        {actual.id === "precio" && (
          <div className="flex flex-col gap-8">
            <div className="grid gap-4 md:grid-cols-3">
              <CampoSelect etiqueta="Moneda" value={v.currency} onChange={texto("currency")}>
                {MONEDAS.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.etiqueta}
                  </option>
                ))}
              </CampoSelect>
              <Campo etiqueta="Precio" value={v.price} onChange={texto("price")} type="number" inputMode="decimal" min={0} step="any" disabled={v.priceOnRequest} />
              <CampoSelect etiqueta="Por" value={v.pricePeriod} onChange={texto("pricePeriod")} disabled={periodos.length === 1}>
                {periodos.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </CampoSelect>
              {v.operation === "ALQUILER_ANUAL" && <Campo etiqueta="Expensas por mes" value={v.expenses} onChange={texto("expenses")} type="number" inputMode="decimal" min={0} step="any" />}
            </div>
            <Tilde marcado={v.priceOnRequest} onChange={(x) => set("priceOnRequest", x)}>
              No mostrar el precio (dice “Consultar”)
            </Tilde>

            {esTemporario && (
              <div className="grid gap-4 md:grid-cols-2">
                <Campo
                  etiqueta={"Limpieza final (" + v.currency + ", opcional)"}
                  value={v.cleaningFee}
                  onChange={texto("cleaningFee")}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  ayuda="Se suma una vez por estadía al total."
                />
                <Campo
                  etiqueta={"Depósito en garantía (" + v.currency + ", opcional)"}
                  value={v.securityDeposit}
                  onChange={texto("securityDeposit")}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  ayuda="Se informa aparte: se devuelve al irse."
                />
              </div>
            )}

            {esTemporario && (
              <section>
                <Rotulo como="p">Temporada: precios y disponibilidad</Rotulo>
                <p className="mt-2 mb-5 max-w-[60ch] text-[14px] leading-relaxed text-texto-2">
                  Cargá los períodos que alquilás (mes, quincenas) con su precio, y marcá los que ya están alquilados. En la publicación se ven como tarjetas con “Disponible” o “Alquilado”.
                </p>
                <EditorPeriodos periodos={v.rates} onChange={(rates) => set("rates", rates)} opciones={periodos} moneda={v.currency} periodoPorDefecto={v.pricePeriod} />
              </section>
            )}
          </div>
        )}

        {actual.id === "disponibilidad" &&
          (id ? (
            <CalendarioOcupado
              iniciales={ocupados}
              periodos={v.rates.flatMap((t) => (t.label && t.startDate && t.endDate && t.endDate > t.startDate ? [{ label: t.label, startDate: t.startDate, endDate: t.endDate }] : []))}
              onGuardar={guardarOcupadosEn(API + id + "/ocupado")}
            />
          ) : (
            <p className="text-[15px] text-texto-2">Primero creá el borrador.</p>
          ))}

        {actual.id === "reglas" && (
          <div className="flex flex-col gap-5">
            {esTemporario && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Campo etiqueta="Entrada desde" value={v.checkInTime} onChange={texto("checkInTime")} type="time" />
                <Campo etiqueta="Salida hasta" value={v.checkOutTime} onChange={texto("checkOutTime")} type="time" />
                <Campo etiqueta="Noches mínimas" value={v.minNights} onChange={texto("minNights")} type="number" inputMode="numeric" min={0} />
              </div>
            )}
            <CampoArea
              etiqueta={esTemporario ? "Reglas de la casa" : "Condiciones y aclaraciones"}
              value={v.houseRules}
              onChange={texto("houseRules")}
              rows={5}
              placeholder={esTemporario ? "No se permiten fiestas. Ropa blanca no incluida…" : "Requisitos, garantía, si acepta permuta o crédito…"}
            />
            <Campo
              etiqueta="WhatsApp para esta propiedad"
              value={v.contactWhatsapp}
              onChange={texto("contactWhatsapp")}
              type="tel"
              inputMode="tel"
              maxLength={30}
              placeholder="2254 123456"
              ayuda="Con código de área, sin 0 ni 15. Ahí te van a escribir los interesados."
            />
          </div>
        )}

        {actual.id === "revision" && (
          <Revision
            v={v}
            zona={zonas.find((z) => z.id === v.zoneId)?.name ?? ""}
            portada={imagenes[0]?.url ?? null}
            fotos={fotos}
            falta={falta}
            faltaCuenta={faltaCuenta}
            propiedad={propiedad}
            ocupado={ocupado}
            irA={(pasoId) => saltarA(pasos.findIndex((p) => p.id === pasoId))}
            onEstado={estado}
          />
        )}

        {id && ultimo && (
          <div className="mt-14 border-t border-gris-200 pt-6">
            <Boton variante="texto" className="!text-error" disabled={ocupado} onClick={eliminar} onBlur={() => setConfirmarBaja(false)}>
              {confirmarBaja ? "¿Seguro? Tocá de nuevo para eliminarla" : "Eliminar esta propiedad"}
            </Boton>
          </div>
        )}
      </div>

      {/* Barra fija de abajo: Atrás · Siguiente */}
      <div className="vidrio-barra fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-[760px] items-center gap-3">
          <Boton variante="secundario" onClick={atras} disabled={paso === 0 || ocupado} aria-label="Paso anterior" className="w-[52px] shrink-0 px-0">
            <Icono nombre="flecha-izq" tamano={20} />
          </Boton>
          <p role="status" aria-live="polite" className={cn("min-w-0 flex-1 text-[13px] leading-snug", error ? "text-error" : "text-texto-2")}>
            {error || (ocupado ? "Guardando…" : publicada && sinGuardar ? "Los cambios se publican al guardar" : id && !sinGuardar ? "Guardado" : "")}
          </p>
          {ultimo ? (
            <Boton href="/panel/propiedades" variante="secundario">
              Listo
            </Boton>
          ) : (
            <Boton onClick={siguiente} disabled={ocupado}>
              {paso === 1 && !id ? "Crear borrador" : "Siguiente"}
            </Boton>
          )}
        </div>
      </div>
    </div>
  );
}

// Ultimo paso: como queda, que falta y el boton segun el estado.
function Revision({
  v,
  zona,
  portada,
  fotos,
  falta,
  faltaCuenta,
  propiedad,
  ocupado,
  irA,
  onEstado,
}: {
  v: ValoresPropiedad;
  zona: string;
  portada: string | null;
  fotos: number;
  falta: string[];
  faltaCuenta: string[];
  propiedad: PropiedadPanel | null;
  ocupado: boolean;
  irA: (paso: string) => void;
  onEstado: (accion: "enviar" | "retirar" | "pausar" | "reanudar") => void;
}) {
  const status = propiedad?.status ?? "BORRADOR";
  const todoListo = falta.length === 0 && faltaCuenta.length === 0;
  const operacion = OPERACIONES.find((o) => o.valor === v.operation)?.etiqueta ?? "";
  const tipo = TIPOS.find((t) => t.valor === v.type)?.etiqueta ?? "";

  return (
    <div className="flex flex-col gap-8">
      <button type="button" onClick={() => irA("descripcion")} className="flex gap-4 rounded-card bg-gris-50 p-4 text-left transition-colors hover:bg-gris-100">
        <div className="size-24 shrink-0 overflow-hidden rounded-campo bg-gris-100 md:size-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {portada && <img src={miniatura(portada)} alt="" className="size-full object-cover" />}
        </div>
        <div className="min-w-0 py-1">
          <Rotulo como="p">
            {tipo} · {zona}
          </Rotulo>
          <p className="mt-2 line-clamp-2 font-titulo text-[18px] font-medium tracking-[-0.01em]">{v.title || "Sin título"}</p>
          <p className="mt-1 text-[14px] text-texto-2">
            {operacion} · {fotos} {fotos === 1 ? "foto" : "fotos"}
          </p>
        </div>
      </button>

      {status === "RECHAZADA" && (
        <div className="rounded-card bg-error/5 px-5 py-4 text-[15px] leading-relaxed text-error">
          <p className="font-medium">La revisamos y hay que corregir algo.</p>
          {propiedad?.rejectionReason && <p className="mt-1">{propiedad.rejectionReason}</p>}
        </div>
      )}

      {(falta.length > 0 || faltaCuenta.length > 0) && status !== "PUBLICADA" && (
        <section>
          <Rotulo como="p">Para enviarla falta</Rotulo>
          <ul className="mt-3 flex flex-col gap-2 text-[15px]">
            {falta.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-negro" aria-hidden="true" />
                {f}
              </li>
            ))}
            {faltaCuenta.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-negro" aria-hidden="true" />
                <span>
                  {f} en{" "}
                  <Link href="/cuenta" className="text-link">
                    tu cuenta
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(status === "BORRADOR" || status === "RECHAZADA") && (
        <div>
          <Boton ancho onClick={() => onEstado("enviar")} disabled={!todoListo || ocupado}>
            Enviar a revisión
          </Boton>
          <p className="mt-3 text-[14px] leading-relaxed text-texto-2">Revisamos que las fotos sean reales y los datos estén completos. Cuando la aprobamos, sale publicada.</p>
        </div>
      )}

      {status === "EN_REVISION" && (
        <div className="rounded-card bg-gris-50 px-5 py-5">
          <p className="text-[16px] font-medium">Está en revisión</p>
          <p className="mt-1 text-[15px] leading-relaxed text-texto-2">Cuando la aprobemos sale publicada. Si necesitás cambiar algo, podés editarla igual.</p>
          <Boton variante="texto" className="mt-3" onClick={() => onEstado("retirar")} disabled={ocupado}>
            Retirar de revisión
          </Boton>
        </div>
      )}

      {status === "PUBLICADA" && propiedad && (
        <div className="rounded-card bg-gris-50 px-5 py-5">
          <p className="flex items-center gap-2 text-[16px] font-medium text-ok">
            <Icono nombre="check" tamano={18} /> Publicada
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-texto-2">
            Los cambios se ven al guardar.{propiedad.needsReview ? " Los últimos los vamos a revisar." : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Boton href={"/propiedad/" + propiedad.slug} variante="secundario" tamano="chico">
              Ver publicación
            </Boton>
            <Boton variante="secundario" tamano="chico" onClick={() => onEstado("pausar")} disabled={ocupado}>
              Pausar
            </Boton>
          </div>
        </div>
      )}

      {status === "PAUSADA" && propiedad && (
        <div className="rounded-card bg-gris-50 px-5 py-5">
          <p className="text-[16px] font-medium">Pausada</p>
          <p className="mt-1 text-[15px] leading-relaxed text-texto-2">No se ve en el sitio. {propiedad.publishedAt ? "Podés reanudarla cuando quieras." : "Enviala a revisión para publicarla."}</p>
          {propiedad.publishedAt && (
            <Boton className="mt-4" tamano="chico" onClick={() => onEstado("reanudar")} disabled={ocupado || falta.length > 0}>
              Reanudar
            </Boton>
          )}
        </div>
      )}
    </div>
  );
}
