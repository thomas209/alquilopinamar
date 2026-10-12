// Los valores de una propiedad tal como los edita un formulario (todo en texto),
// y la conversion desde la base. Lo usan el admin y el panel del propietario.
import type { MonedaPrecio, Operacion, PeriodoPrecio, Tipo } from "@/lib/etiquetas";

export type TarifaForm = {
  label: string;
  period: PeriodoPrecio;
  amount: string;
  currency: MonedaPrecio;
  startDate: string;
  endDate: string;
  dailyAmount: string;
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
  cleaningFee: string;
  securityDeposit: string;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
  minNights: string;
  contactWhatsapp: string;
  isFeatured: boolean;
  featuredOrder: string;
  amenityIds: string[];
  rates: TarifaForm[];
};

export const VALORES_VACIOS: ValoresPropiedad = {
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
  cleaningFee: "",
  securityDeposit: "",
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

const dia = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const num = (n: number | null) => (n === null ? "" : String(n));
const dec = (n: { toString(): string } | null) => (n === null ? "" : String(Number(n)));

type DesdeBase = {
  title: string;
  description: string;
  operation: Operacion;
  type: Tipo;
  zoneId: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  showExactLocation: boolean;
  distanceToSeaM: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  maxGuests: number | null;
  coveredM2: number | null;
  lotM2: number | null;
  hasPool: boolean;
  petsAllowed: boolean;
  price: { toString(): string } | null;
  currency: MonedaPrecio;
  pricePeriod: PeriodoPrecio;
  priceOnRequest: boolean;
  expenses: { toString(): string } | null;
  cleaningFee: { toString(): string } | null;
  securityDeposit: { toString(): string } | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  minNights: number | null;
  contactWhatsapp: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  amenities: { amenityId: string }[];
  rates: {
    label: string;
    period: PeriodoPrecio;
    amount: { toString(): string };
    currency: MonedaPrecio;
    startDate: Date | null;
    endDate: Date | null;
    dailyAmount: { toString(): string } | null;
  }[];
};

// Propiedad de la base (con amenities y tarifas) → valores del formulario.
export function valoresDesdeBase(p: DesdeBase): ValoresPropiedad {
  return {
    title: p.title,
    description: p.description,
    operation: p.operation,
    type: p.type,
    zoneId: p.zoneId,
    address: p.address ?? "",
    lat: num(p.lat),
    lng: num(p.lng),
    showExactLocation: p.showExactLocation,
    distanceToSeaM: num(p.distanceToSeaM),
    rooms: num(p.rooms),
    bedrooms: num(p.bedrooms),
    bathrooms: num(p.bathrooms),
    garages: num(p.garages),
    maxGuests: num(p.maxGuests),
    coveredM2: num(p.coveredM2),
    lotM2: num(p.lotM2),
    hasPool: p.hasPool,
    petsAllowed: p.petsAllowed,
    price: dec(p.price),
    currency: p.currency,
    pricePeriod: p.pricePeriod,
    priceOnRequest: p.priceOnRequest,
    expenses: dec(p.expenses),
    cleaningFee: dec(p.cleaningFee),
    securityDeposit: dec(p.securityDeposit),
    houseRules: p.houseRules ?? "",
    checkInTime: p.checkInTime ?? "",
    checkOutTime: p.checkOutTime ?? "",
    minNights: num(p.minNights),
    contactWhatsapp: p.contactWhatsapp ?? "",
    isFeatured: p.isFeatured,
    featuredOrder: num(p.featuredOrder),
    amenityIds: p.amenities.map((a) => a.amenityId),
    rates: p.rates.map((t) => ({
      label: t.label,
      period: t.period,
      amount: String(Number(t.amount)),
      currency: t.currency,
      startDate: dia(t.startDate),
      endDate: dia(t.endDate),
      dailyAmount: dec(t.dailyAmount),
    })),
  };
}
