// Reglas de una propiedad: validar lo que llega del formulario, armar el slug
// y decir que le falta para poder publicarse (ver docs/06-business-rules.md).
import { coordenada, enteroONull, fecha, numero, texto } from "@/lib/api";
import { slugify } from "@/lib/slug";
import { formatearCodigo } from "@/lib/formato";
import {
  MONEDAS,
  OPERACIONES,
  PERIODOS,
  PERIODOS_POR_OPERACION,
  TIPOS,
  type MonedaPrecio,
  type Operacion,
  type PeriodoPrecio,
  type Tipo,
} from "@/lib/etiquetas";

export { MIN_DESCRIPCION, MIN_FOTOS, MIN_FOTOS_LOTE } from "@/lib/requisitos";

function enLista<T extends string>(lista: readonly { valor: T }[], valor: unknown): T | null {
  return lista.find((x) => x.valor === valor)?.valor ?? null;
}

// La descripcion no puede llevar datos de contacto: el contacto pasa por el sitio.
export function tieneContacto(textoLibre: string): boolean {
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(textoLibre)) return true; // mail
  if (/(https?:\/\/|www\.)\S+/i.test(textoLibre)) return true; // link
  // telefono: 9 digitos o mas seguidos (con espacios, guiones o parentesis en el medio)
  const candidatos = textoLibre.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [];
  return candidatos.some((c) => c.replace(/\D/g, "").length >= 9);
}

// "Casa en el bosque" + 123 -> "casa-en-el-bosque-ap-0123"
export function armarSlug(titulo: string, code: number): string {
  const base = slugify(titulo).slice(0, 60).replace(/-+$/, "");
  return (base ? base + "-" : "") + formatearCodigo(code).toLowerCase();
}

export type TarifaValida = {
  label: string;
  period: PeriodoPrecio;
  amount: number;
  currency: MonedaPrecio;
  startDate: Date | null;
  endDate: Date | null;
  minNights: number | null;
  isAvailable: boolean;
  dailyAmount: number | null;
};

// Valida y ordena lo que llega del formulario de propiedad (alta y edicion).
export function datosDePropiedad(body: Record<string, unknown>) {
  const mal = (error: string) => ({ ok: false as const, error });

  const title = texto(body.title, 120);
  if (!title) return mal("Poné un título.");

  const operation = enLista<Operacion>(OPERACIONES, body.operation);
  if (!operation) return mal("Elegí la operación.");

  const type = enLista<Tipo>(TIPOS, body.type);
  if (!type) return mal("Elegí el tipo de propiedad.");

  const zoneId = texto(body.zoneId, 40);
  if (!zoneId) return mal("Elegí la zona.");

  const description = texto(body.description, 8000) ?? "";
  if (tieneContacto(description)) {
    return mal("La descripción no puede tener teléfonos, mails ni links. El contacto va en el campo de WhatsApp.");
  }

  const currency = enLista<MonedaPrecio>(MONEDAS, body.currency) ?? "USD";
  const permitidos = PERIODOS_POR_OPERACION[operation];
  const pedido = enLista<PeriodoPrecio>(PERIODOS, body.pricePeriod);
  const pricePeriod = pedido && permitidos.includes(pedido) ? pedido : permitidos[0];

  const tarifas: TarifaValida[] = [];
  const crudas = Array.isArray(body.rates) ? body.rates.slice(0, 30) : [];
  for (const cruda of crudas) {
    if (!cruda || typeof cruda !== "object") continue;
    const t = cruda as Record<string, unknown>;
    const label = texto(t.label, 80);
    const amount = numero(t.amount);
    if (!label && amount === null) continue; // fila vacia
    if (!label) return mal("A una tarifa le falta el nombre (ej: Enero · 1ra quincena).");
    if (amount === null) return mal("A la tarifa “" + label + "” le falta el precio.");
    const startDate = fecha(t.startDate);
    const endDate = fecha(t.endDate);
    if (startDate && endDate && endDate <= startDate) {
      return mal("En “" + label + "” la salida tiene que ser después de la entrada.");
    }
    if (Boolean(startDate) !== Boolean(endDate)) return mal("En “" + label + "” completá las dos fechas, o dejalas vacías.");
    tarifas.push({
      label,
      amount,
      period: enLista<PeriodoPrecio>(PERIODOS, t.period) ?? pricePeriod,
      currency: enLista<MonedaPrecio>(MONEDAS, t.currency) ?? currency,
      startDate,
      endDate,
      minNights: enteroONull(t.minNights, 365),
      isAvailable: t.isAvailable !== false,
      dailyAmount: numero(t.dailyAmount),
    });
  }

  const amenityIds = Array.isArray(body.amenityIds)
    ? [...new Set(body.amenityIds.filter((x): x is string => typeof x === "string"))].slice(0, 100)
    : [];

  const esTemporario = operation === "ALQUILER_TEMPORARIO";

  return {
    ok: true as const,
    amenityIds,
    tarifas,
    datos: {
      title,
      description,
      operation,
      type,
      zoneId,
      address: texto(body.address, 200),
      lat: coordenada(body.lat, 90),
      lng: coordenada(body.lng, 180),
      showExactLocation: body.showExactLocation === true,
      distanceToSeaM: enteroONull(body.distanceToSeaM, 100000),
      rooms: enteroONull(body.rooms, 99),
      bedrooms: enteroONull(body.bedrooms, 99),
      bathrooms: enteroONull(body.bathrooms, 99),
      garages: enteroONull(body.garages, 99),
      maxGuests: enteroONull(body.maxGuests, 99),
      coveredM2: enteroONull(body.coveredM2, 100000),
      lotM2: enteroONull(body.lotM2, 10000000),
      hasPool: body.hasPool === true,
      petsAllowed: body.petsAllowed === true,
      price: body.priceOnRequest === true ? null : numero(body.price),
      currency,
      pricePeriod,
      priceOnRequest: body.priceOnRequest === true,
      expenses: operation === "ALQUILER_ANUAL" ? numero(body.expenses) : null,
      houseRules: texto(body.houseRules, 4000),
      checkInTime: esTemporario ? texto(body.checkInTime, 10) : null,
      checkOutTime: esTemporario ? texto(body.checkOutTime, 10) : null,
      minNights: esTemporario ? enteroONull(body.minNights, 365) : null,
      contactWhatsapp: texto(body.contactWhatsapp, 30),
      isFeatured: body.isFeatured === true,
      featuredOrder: body.isFeatured === true ? enteroONull(body.featuredOrder, 9999) : null,
    },
  };
}

export { faltaParaPublicar, mensajeFalta } from "@/lib/requisitos";
