// Fotos de portada que se cargan desde el admin:
//  - "home": la portada de la home (SiteSetting "home.portada").
//  - "zona:<slug>": la portada de una zona (Zone.coverImage).
// Las imagenes viven en <CLOUDINARY_FOLDER>/portadas/...
import { prisma } from "@/lib/prisma";

export const CLAVE_PORTADA_HOME = "home.portada";

export type Destino = { tipo: "home" } | { tipo: "zona"; slug: string };

export function leerDestino(valor: unknown): Destino | null {
  if (valor === "home") return { tipo: "home" };
  if (typeof valor === "string" && /^zona:[a-z0-9-]{1,80}$/.test(valor)) return { tipo: "zona", slug: valor.slice(5) };
  return null;
}

export const subcarpetaDe = (d: Destino) => (d.tipo === "home" ? "portadas/home" : "portadas/zonas/" + d.slug);

export async function leerPortadaHome(): Promise<string | null> {
  const s = await prisma.siteSetting.findUnique({ where: { key: CLAVE_PORTADA_HOME } });
  const v = s?.value as { url?: unknown } | null | undefined;
  return typeof v?.url === "string" ? v.url : null;
}

// URL guardada hoy para ese destino (o null)
export async function portadaActual(d: Destino): Promise<string | null> {
  if (d.tipo === "home") return leerPortadaHome();
  const z = await prisma.zone.findUnique({ where: { slug: d.slug }, select: { coverImage: true } });
  return z?.coverImage ?? null;
}

export async function guardarPortada(d: Destino, url: string | null): Promise<void> {
  if (d.tipo === "home") {
    if (url === null) await prisma.siteSetting.deleteMany({ where: { key: CLAVE_PORTADA_HOME } });
    else await prisma.siteSetting.upsert({ where: { key: CLAVE_PORTADA_HOME }, update: { value: { url } }, create: { key: CLAVE_PORTADA_HOME, value: { url } } });
    return;
  }
  await prisma.zone.update({ where: { slug: d.slug }, data: { coverImage: url } });
}
