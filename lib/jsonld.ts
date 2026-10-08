// JSON-LD de una ficha: aviso inmobiliario (schema.org RealEstateListing) con
// la propiedad adentro. La direccion exacta nunca se publica; las coordenadas
// solo si el dueño eligio mostrar el punto exacto.
import { fotoUrl } from "@/lib/foto";
import { etiquetaDe, OPERACIONES, TIPOS } from "@/lib/etiquetas";
import { ETIQUETA_PERIODO, formatearCodigo } from "@/lib/formato";
import { SITE_NOMBRE, SITE_URL, urlAbsoluta } from "@/lib/seo";
import type { FichaPropiedad } from "@/lib/sitio";

const TIPO_SCHEMA: Record<FichaPropiedad["type"], string> = {
  CASA: "House",
  DUPLEX: "House",
  CABANA: "House",
  DEPARTAMENTO: "Apartment",
  LOTE: "Place",
  LOCAL: "Place",
};

export function jsonLdPropiedad(p: FichaPropiedad) {
  const url = urlAbsoluta("/propiedad/" + p.slug);
  const tipo = TIPO_SCHEMA[p.type];
  const esVivienda = tipo !== "Place";
  const metros = (m: number | null) => (m ? { "@type": "QuantitativeValue", value: m, unitCode: "MTK" } : undefined);

  const lugar = {
    "@type": tipo,
    name: p.title,
    address: { "@type": "PostalAddress", addressLocality: p.zona.name, addressRegion: "Buenos Aires", addressCountry: "AR" },
    ...(p.ubicacionExacta ? { geo: { "@type": "GeoCoordinates", latitude: p.ubicacionExacta.lat, longitude: p.ubicacionExacta.lng } } : {}),
    ...(esVivienda
      ? {
          numberOfRooms: p.rooms ?? undefined,
          numberOfBedrooms: p.bedrooms ?? undefined,
          numberOfBathroomsTotal: p.bathrooms ?? undefined,
          floorSize: metros(p.coveredM2),
          petsAllowed: p.petsAllowed,
          ...(p.operation === "ALQUILER_TEMPORARIO" && p.maxGuests ? { occupancy: { "@type": "QuantitativeValue", maxValue: p.maxGuests } } : {}),
          amenityFeature: [
            ...(p.hasPool ? [{ "@type": "LocationFeatureSpecification", name: "Pileta", value: true }] : []),
            ...p.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.name, value: true })),
          ],
        }
      : { ...(p.lotM2 ? { additionalProperty: { "@type": "PropertyValue", name: "Superficie del lote", value: p.lotM2, unitCode: "MTK" } } : {}) }),
  };

  const periodo = ETIQUETA_PERIODO[p.pricePeriod];
  const oferta =
    p.price === null
      ? undefined
      : {
          "@type": "Offer",
          price: p.price,
          priceCurrency: p.currency,
          availability: "https://schema.org/InStock",
          businessFunction: p.operation === "VENTA" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
          url,
          ...(periodo ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: p.currency, unitText: periodo } } : {}),
        };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: p.title,
    description: p.description,
    identifier: formatearCodigo(p.code),
    category: etiquetaDe(OPERACIONES, p.operation) + " · " + etiquetaDe(TIPOS, p.type),
    image: p.fotos.slice(0, 10).map((f) => fotoUrl(f.url, "c_limit,w_1600,q_auto,f_jpg")),
    ...(p.publishedAt ? { datePosted: p.publishedAt } : {}),
    dateModified: p.updatedAt,
    about: lugar,
    ...(oferta ? { offers: oferta } : {}),
    provider: { "@type": "Organization", name: SITE_NOMBRE, url: SITE_URL },
  };
}

// Datos del sitio para la home: quien publica y el sitio en si.
export function jsonLdSitio() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_URL + "/#sitio",
      url: SITE_URL,
      name: SITE_NOMBRE,
      inLanguage: "es-AR",
      publisher: { "@id": SITE_URL + "/#organizacion" },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": SITE_URL + "/#organizacion",
      name: SITE_NOMBRE,
      url: SITE_URL,
      description: "Alquiler temporario, alquiler anual y venta de propiedades en el Partido de Pinamar.",
      areaServed: ["Pinamar", "Cariló", "Valeria del Mar", "Ostende", "Costa Esmeralda"].map((n) => ({ "@type": "Place", name: n + ", Buenos Aires, Argentina" })),
    },
  ];
}
