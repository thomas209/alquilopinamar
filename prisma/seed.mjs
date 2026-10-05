// DATOS INICIALES: las 5 zonas y los amenities base.
// Se puede correr todas las veces que haga falta: no duplica ni pisa lo que
// ya se haya editado desde el admin (solo crea lo que falta).
//
// Uso: npm run db:seed   (solo base local; pasa por db-guard)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ZONAS = [
  { slug: "pinamar", name: "Pinamar" },
  { slug: "carilo", name: "Cariló" },
  { slug: "valeria-del-mar", name: "Valeria del Mar" },
  { slug: "ostende", name: "Ostende" },
  { slug: "costa-esmeralda", name: "Costa Esmeralda" },
];

const AMENITIES = [
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

try {
  let zonas = 0;
  for (const [i, z] of ZONAS.entries()) {
    const existe = await prisma.zone.findUnique({ where: { slug: z.slug } });
    if (existe) continue;
    await prisma.zone.create({ data: { ...z, sortOrder: i } });
    zonas++;
  }

  let amenities = 0;
  for (const [i, a] of AMENITIES.entries()) {
    const existe = await prisma.amenity.findUnique({ where: { slug: a.slug } });
    if (existe) continue;
    await prisma.amenity.create({ data: { ...a, sortOrder: i } });
    amenities++;
  }

  console.log("\nDatos iniciales cargados: " + zonas + " zonas nuevas, " + amenities + " amenities nuevos.\n");
} catch (e) {
  console.error("\nNo se pudieron cargar los datos iniciales: " + e.message + "\n");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
