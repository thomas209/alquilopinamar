import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Galeria from "@/components/site/Galeria";
import PropiedadCard from "@/components/site/PropiedadCard";
import TextoPlegable from "@/components/site/TextoPlegable";
import Boton from "@/components/ui/Boton";
import Icono from "@/components/ui/Icono";
import Precio from "@/components/ui/Precio";
import Rotulo from "@/components/ui/Rotulo";
import { etiquetaDe, OPERACIONES, TIPOS } from "@/lib/etiquetas";
import { ETIQUETA_PERIODO, formatearCodigo, formatearMonto } from "@/lib/formato";
import { fotoUrl } from "@/lib/foto";
import { datosClave } from "@/lib/busqueda";
import { linkWhatsapp, numeroWhatsapp } from "@/lib/whatsapp";
import { propiedadPorSlug, similares, type FichaPropiedad } from "@/lib/sitio";

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await propiedadPorSlug(slug);
  if (!p) return { title: "Propiedad no encontrada" };
  const titulo = p.title + " · " + etiquetaDe(OPERACIONES, p.operation) + " en " + p.zona.name;
  const descripcion = p.description.replace(/\s+/g, " ").slice(0, 155);
  const imagen = p.fotos[0] ? fotoUrl(p.fotos[0].url, "c_fill,g_auto,w_1200,h_630,q_auto,f_jpg") : undefined;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: "/propiedad/" + p.slug },
    openGraph: { title: titulo, description: descripcion, url: "/propiedad/" + p.slug, images: imagen ? [{ url: imagen, width: 1200, height: 630 }] : undefined },
  };
}

function caracteristicas(p: FichaPropiedad): { etiqueta: string; valor: string }[] {
  const n = (x: number) => x.toLocaleString("es-AR");
  const lista: { etiqueta: string; valor: string }[] = [];
  if (p.maxGuests && p.operation === "ALQUILER_TEMPORARIO") lista.push({ etiqueta: "Huéspedes", valor: n(p.maxGuests) });
  if (p.rooms) lista.push({ etiqueta: "Ambientes", valor: n(p.rooms) });
  if (p.bedrooms) lista.push({ etiqueta: "Dormitorios", valor: n(p.bedrooms) });
  if (p.bathrooms) lista.push({ etiqueta: "Baños", valor: n(p.bathrooms) });
  if (p.garages) lista.push({ etiqueta: "Cocheras", valor: n(p.garages) });
  if (p.coveredM2) lista.push({ etiqueta: "Cubiertos", valor: n(p.coveredM2) + " m²" });
  if (p.lotM2) lista.push({ etiqueta: "Lote", valor: n(p.lotM2) + " m²" });
  if (p.distanceToSeaM !== null) lista.push({ etiqueta: "Al mar", valor: p.distanceToSeaM >= 1000 ? (p.distanceToSeaM / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " km" : n(p.distanceToSeaM) + " m" });
  if (p.hasPool) lista.push({ etiqueta: "Pileta", valor: "Sí" });
  lista.push({ etiqueta: "Mascotas", valor: p.petsAllowed ? "Sí" : "No" });
  return lista;
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gris-200 py-8">
      <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function PropiedadPage({ params }: Props) {
  const { slug } = await params;
  const p = await propiedadPorSlug(slug);
  if (!p) notFound();

  const otras = await similares(p.id, p.zona.id, p.operation);
  const codigo = formatearCodigo(p.code);
  const tipo = etiquetaDe(TIPOS, p.type);
  const datos = datosClave(p);
  const numero = numeroWhatsapp(p.contactWhatsapp);
  const whatsapp = numero ? linkWhatsapp(numero, "Hola, consulto por " + codigo + " – " + p.title + " (" + SITE_URL + "/propiedad/" + p.slug + ")") : null;
  const reglas = [
    p.checkInTime && "Entrada: " + p.checkInTime,
    p.checkOutTime && "Salida: " + p.checkOutTime,
    p.minNights && "Estadía mínima: " + p.minNights + (p.minNights === 1 ? " noche" : " noches"),
    p.petsAllowed ? "Se aceptan mascotas" : "No se aceptan mascotas",
  ].filter((x): x is string => Boolean(x));

  const contacto = whatsapp ? (
    <Boton href={whatsapp} target="_blank" rel="noopener noreferrer" ancho>
      Consultar por WhatsApp
    </Boton>
  ) : (
    <p className="text-[13px] text-texto-2">Para consultar mencioná el código {codigo}.</p>
  );

  return (
    <div className="mx-auto max-w-[1440px] pb-28 md:px-12 md:pt-6 md:pb-0">
      <Galeria fotos={p.fotos} titulo={p.title} />

      <div className="px-4 md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-16 md:px-0">
        <div>
          <header className="py-6 md:py-8">
            <Rotulo como="p">
              {codigo} ·{" "}
              <Link href={"/zonas/" + p.zona.slug} className="hover:text-negro">
                {p.zona.name}
              </Link>{" "}
              · {tipo}
            </Rotulo>
            <h1 className="mt-3 font-titulo text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">{p.title}</h1>
            {datos && <p className="mt-2 text-[15px] text-texto-2">{datos}</p>}
            <div className="mt-4 md:hidden">
              <Precio monto={p.price} moneda={p.currency} periodo={p.pricePeriod} tamano="ficha" />
              {p.expenses !== null && <p className="mt-1 text-[14px] text-texto-2">+ {formatearMonto(p.expenses, "ARS")} de expensas</p>}
            </div>
          </header>

          <Seccion titulo="Descripción">
            <TextoPlegable texto={p.description} className="max-w-[68ch] text-[16px] leading-relaxed" />
          </Seccion>

          <Seccion titulo="Características">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {caracteristicas(p).map((c) => (
                <div key={c.etiqueta}>
                  <dt>
                    <Rotulo>{c.etiqueta}</Rotulo>
                  </dt>
                  <dd className="mt-1.5 font-titulo text-[18px] font-medium tracking-[-0.02em] tabular-nums">{c.valor}</dd>
                </div>
              ))}
            </dl>
          </Seccion>

          {p.amenities.length > 0 && (
            <Seccion titulo="Comodidades">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {p.amenities.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-[15px]">
                    <Icono nombre="check" tamano={18} className="shrink-0 text-texto-2" />
                    {a.name}
                  </li>
                ))}
              </ul>
            </Seccion>
          )}

          {p.tarifas.length > 0 && (
            <Seccion titulo="Tarifas">
              <ul className="max-w-[560px] divide-y divide-gris-200">
                {p.tarifas.map((t) => (
                  <li key={t.id} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-[15px]">
                      {t.label}
                      {t.minNights ? <span className="text-texto-2"> · mín. {t.minNights} noches</span> : null}
                    </span>
                    <span className="shrink-0 font-titulo text-[15px] font-medium tabular-nums">
                      {formatearMonto(t.amount, t.currency)}
                      {ETIQUETA_PERIODO[t.period] && <span className="font-sans text-[13px] font-normal text-texto-2"> / {ETIQUETA_PERIODO[t.period]}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Seccion>
          )}

          {(p.operation === "ALQUILER_TEMPORARIO" || p.houseRules) && (
            <Seccion titulo="Reglas de la casa">
              {p.operation === "ALQUILER_TEMPORARIO" && (
                <ul className="space-y-2 text-[15px]">
                  {reglas.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
              {p.houseRules && <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-line text-texto-2">{p.houseRules}</p>}
            </Seccion>
          )}
        </div>

        {/* Desktop: tarjeta fija con el precio y el contacto */}
        <aside className="hidden md:block">
          <div className="sticky top-24 mt-8 rounded-hoja border border-gris-200 p-6 shadow-flotante">
            <Precio monto={p.price} moneda={p.currency} periodo={p.pricePeriod} tamano="ficha" />
            {p.expenses !== null && <p className="mt-1 text-[14px] text-texto-2">+ {formatearMonto(p.expenses, "ARS")} de expensas</p>}
            <p className="mt-1 text-[14px] text-texto-2">
              {etiquetaDe(OPERACIONES, p.operation)} · {p.zona.name}
            </p>
            <div className="mt-5">{contacto}</div>
          </div>
        </aside>
      </div>

      {otras.length > 0 && (
        <section className="mt-6 border-t border-gris-200 pt-10">
          <h2 className="px-4 font-titulo text-[22px] font-medium tracking-[-0.02em] md:px-0">Otras propiedades en {p.zona.name}</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 lg:grid-cols-4">
            {otras.map((o) => (
              <PropiedadCard key={o.id} p={o} aBorde />
            ))}
          </div>
        </section>
      )}

      {/* Celular: barra fija abajo con el precio y el contacto */}
      <div className="vidrio-barra fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Precio monto={p.price} moneda={p.currency} periodo={p.pricePeriod} className="shrink-0 text-[17px]" />
          <div className="min-w-0 flex-1 text-right">{whatsapp ? <Boton href={whatsapp} target="_blank" rel="noopener noreferrer" tamano="chico">Consultar</Boton> : <Rotulo>{codigo}</Rotulo>}</div>
        </div>
      </div>
    </div>
  );
}
