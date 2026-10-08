// Zonas y amenities con los que arranca el sitio. Los usan:
//   - prisma/seed.mjs (base local)
//   - scripts/db-preparar-prod.mjs (produccion, una sola vez al publicar)
export const ZONAS = [
  { slug: "pinamar", name: "Pinamar" },
  { slug: "carilo", name: "Cariló" },
  { slug: "valeria-del-mar", name: "Valeria del Mar" },
  { slug: "ostende", name: "Ostende" },
  { slug: "costa-esmeralda", name: "Costa Esmeralda" },
];

export const AMENITIES = [
  { slug: "wifi", name: "Wifi" },
  { slug: "parrilla", name: "Parrilla" },
  { slug: "aire-acondicionado", name: "Aire acondicionado" },
  { slug: "calefaccion", name: "Calefacción" },
  { slug: "pileta-climatizada", name: "Pileta climatizada" },
  { slug: "cochera-cubierta", name: "Cochera cubierta" },
  { slug: "ropa-blanca", name: "Ropa blanca" },
  { slug: "lavarropas", name: "Lavarropas" },
  { slug: "seguridad", name: "Seguridad" },
  { slug: "quincho", name: "Quincho" },
  { slug: "jardin", name: "Jardín" },
  { slug: "vista-al-mar", name: "Vista al mar" },
];

// Crea solo lo que falta (por slug). Nunca pisa ni borra lo editado desde el admin.
export async function cargarDatosIniciales(prisma) {
  let zonas = 0;
  for (const [i, z] of ZONAS.entries()) {
    if (await prisma.zone.findUnique({ where: { slug: z.slug } })) continue;
    await prisma.zone.create({ data: { ...z, sortOrder: i } });
    zonas++;
  }
  let amenities = 0;
  for (const [i, a] of AMENITIES.entries()) {
    if (await prisma.amenity.findUnique({ where: { slug: a.slug } })) continue;
    await prisma.amenity.create({ data: { ...a, sortOrder: i } });
    amenities++;
  }
  return { zonas, amenities };
}
