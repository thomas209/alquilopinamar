// Consultas de la parte publica. Solo salen propiedades PUBLICADAS y sin baja.
// Todo queda en cache y se refresca cuando se guarda algo en el admin (lib/cache.ts).
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TAG_SITIO } from "@/lib/cache";
import type { MonedaPrecio, Operacion, PeriodoPrecio, Tipo } from "@/lib/etiquetas";

export type Orden = "destacadas" | "nuevas" | "precio-asc" | "precio-desc";

export type FiltrosListado = {
  operacion?: Operacion;
  zona?: string; // slug
  tipo?: Tipo;
  dormitorios?: number; // minimo
  pileta?: boolean;
  mascotas?: boolean;
  orden?: Orden;
};

export type CardPropiedad = {
  id: string;
  code: number;
  slug: string;
  title: string;
  operation: Operacion;
  type: Tipo;
  zona: string;
  bedrooms: number | null;
  bathrooms: number | null;
  maxGuests: number | null;
  coveredM2: number | null;
  lotM2: number | null;
  price: number | null; // null = "Consultar"
  currency: MonedaPrecio;
  pricePeriod: PeriodoPrecio;
  isFeatured: boolean;
  fotos: string[];
};

const PUBLICA = { status: "PUBLICADA", deletedAt: null } as const;
const MAX_LISTADO = 60;

const SELECT_CARD = {
  id: true,
  code: true,
  slug: true,
  title: true,
  operation: true,
  type: true,
  bedrooms: true,
  bathrooms: true,
  maxGuests: true,
  coveredM2: true,
  lotM2: true,
  price: true,
  currency: true,
  pricePeriod: true,
  priceOnRequest: true,
  isFeatured: true,
  zone: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 5, select: { url: true } },
} satisfies Prisma.PropertySelect;

type FilaCard = Prisma.PropertyGetPayload<{ select: typeof SELECT_CARD }>;

function aCard(p: FilaCard): CardPropiedad {
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    title: p.title,
    operation: p.operation,
    type: p.type,
    zona: p.zone.name,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    maxGuests: p.maxGuests,
    coveredM2: p.coveredM2,
    lotM2: p.lotM2,
    price: p.priceOnRequest || p.price === null ? null : Number(p.price),
    currency: p.currency,
    pricePeriod: p.pricePeriod,
    isFeatured: p.isFeatured,
    fotos: p.images.map((i) => i.url),
  };
}

const DESTACADAS_PRIMERO: Prisma.PropertyOrderByWithRelationInput[] = [
  { isFeatured: "desc" },
  { featuredOrder: { sort: "asc", nulls: "last" } },
  { publishedAt: "desc" },
];

function ordenDe(orden: Orden | undefined): Prisma.PropertyOrderByWithRelationInput[] {
  if (orden === "nuevas") return [{ publishedAt: "desc" }];
  if (orden === "precio-asc") return [{ price: { sort: "asc", nulls: "last" } }];
  if (orden === "precio-desc") return [{ price: { sort: "desc", nulls: "last" } }];
  return DESTACADAS_PRIMERO;
}

const cache = <A extends unknown[], R>(fn: (...a: A) => Promise<R>, clave: string) =>
  unstable_cache(fn, ["sitio", clave], { tags: [TAG_SITIO], revalidate: 600 });

export const listarPropiedades = cache(async (f: FiltrosListado): Promise<CardPropiedad[]> => {
  const filas = await prisma.property.findMany({
    where: {
      ...PUBLICA,
      ...(f.operacion ? { operation: f.operacion } : {}),
      ...(f.tipo ? { type: f.tipo } : {}),
      ...(f.zona ? { zone: { slug: f.zona } } : {}),
      ...(f.dormitorios ? { bedrooms: { gte: f.dormitorios } } : {}),
      ...(f.pileta ? { hasPool: true } : {}),
      ...(f.mascotas ? { petsAllowed: true } : {}),
    },
    orderBy: ordenDe(f.orden),
    take: MAX_LISTADO,
    select: SELECT_CARD,
  });
  return filas.map(aCard);
}, "listado");

export const destacadas = cache(async (): Promise<CardPropiedad[]> => {
  const filas = await prisma.property.findMany({
    where: { ...PUBLICA, isFeatured: true },
    orderBy: DESTACADAS_PRIMERO,
    take: 10,
    select: SELECT_CARD,
  });
  return filas.map(aCard);
}, "destacadas");

export const recientes = cache(async (): Promise<CardPropiedad[]> => {
  const filas = await prisma.property.findMany({ where: PUBLICA, orderBy: { publishedAt: "desc" }, take: 8, select: SELECT_CARD });
  return filas.map(aCard);
}, "recientes");

export const similares = cache(async (id: string, zoneId: string, operation: Operacion): Promise<CardPropiedad[]> => {
  const filas = await prisma.property.findMany({
    where: { ...PUBLICA, id: { not: id }, operation, zoneId },
    orderBy: DESTACADAS_PRIMERO,
    take: 4,
    select: SELECT_CARD,
  });
  return filas.map(aCard);
}, "similares");

export const zonasActivas = cache(async () => {
  return prisma.zone.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { slug: true, name: true },
  });
}, "zonas");

// Ficha completa. La direccion exacta nunca sale de aca.
export const propiedadPorSlug = cache(async (slug: string) => {
  const p = await prisma.property.findFirst({
    where: { ...PUBLICA, slug },
    include: {
      zone: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, width: true, height: true } },
      amenities: { select: { amenity: { select: { id: true, name: true, sortOrder: true } } } },
      rates: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    title: p.title,
    description: p.description,
    operation: p.operation as Operacion,
    type: p.type as Tipo,
    zona: p.zone,
    rooms: p.rooms,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    garages: p.garages,
    maxGuests: p.maxGuests,
    coveredM2: p.coveredM2,
    lotM2: p.lotM2,
    distanceToSeaM: p.distanceToSeaM,
    hasPool: p.hasPool,
    petsAllowed: p.petsAllowed,
    price: p.priceOnRequest || p.price === null ? null : Number(p.price),
    currency: p.currency as MonedaPrecio,
    pricePeriod: p.pricePeriod as PeriodoPrecio,
    expenses: p.expenses === null ? null : Number(p.expenses),
    houseRules: p.houseRules,
    checkInTime: p.checkInTime,
    checkOutTime: p.checkOutTime,
    minNights: p.minNights,
    contactWhatsapp: p.contactWhatsapp,
    fotos: p.images,
    amenities: p.amenities.map((a) => a.amenity).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    tarifas: p.rates.map((t) => ({
      id: t.id,
      label: t.label,
      period: t.period as PeriodoPrecio,
      amount: Number(t.amount),
      currency: t.currency as MonedaPrecio,
      minNights: t.minNights,
    })),
  };
}, "ficha");

export type FichaPropiedad = NonNullable<Awaited<ReturnType<typeof propiedadPorSlug>>>;
