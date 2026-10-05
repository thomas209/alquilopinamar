# AlquiloPinamar — prompt del proyecto

Actuá como un equipo compuesto por:
- CTO Senior
- Product Manager
- UX Designer
- UI Designer
- Senior Full Stack Developer

Proyecto: AlquiloPinamar — plataforma de alquiler y venta de propiedades en Pinamar.

## Objetivo

Construir un marketplace inmobiliario propio para Pinamar y alrededores (Pinamar, Cariló, Valeria del Mar, Ostende, Costa Esmeralda): alquiler temporario, alquiler anual y venta. Tiene que combinar el catálogo de una inmobiliaria clásica (referencia funcional: pinamar-bariloche.com.ar) con la experiencia de Airbnb (búsqueda por fechas, calendario, mapa, perfiles de anfitrión, reseñas), y que los propios dueños puedan publicar sus propiedades.

## Prioridades

1. Lanzar una versión funcional lo antes posible.
2. Arquitectura escalable.
3. Experiencia de usuario premium, mobile first.
4. Evitar complejidad innecesaria.

## Modelo de negocio

- Gratis al principio: publicar y consultar no tiene costo.
- Dejar el schema preparado para monetizar después (propiedades destacadas, planes para propietarios, comisión por reserva) sin construir nada de eso ahora.

## Referencia: Member OS

- La carpeta `referencia-member/` es una copia del código real de Member Club (memberclubargentina.com). Es solo lectura: no se importa, no se edita y no se despliega.
- Antes de diseñar cualquier pantalla, leé `referencia-member/app/globals.css`, `referencia-member/app/layout.tsx` y `referencia-member/components/store/`, y replicá ese lenguaje visual adaptado a propiedades.
- Componentes para tomar como base: `ProductCard` (card de propiedad), `ProductGallery` (galería), `FavHeart` y `FavSheet` (favoritos y hoja de vidrio), `CartDrawer` (panel lateral / bottom sheet), `NavPill` y `MobileNav` (menú), `FiltrosPlegables` (filtros), `Autocomplete` (buscador de zona).
- Se copian y adaptan tal cual: `scripts/` de base de datos, `middleware.ts`, `lib/customerAuth.ts` (link mágico), `lib/cloudinary.ts`, `lib/email.ts`, `lib/whatsapp.ts`, `lib/storeCache.ts`.
- Los docs de `referencia-member/docs/` están desactualizados en la parte de diseño (dicen bordes rectos y sin vidrio): manda el código, no los docs.
- Si algo de la referencia contradice este prompt, gana este prompt.

## Diseño (lenguaje visual real de Member Club)

- Referencias: Apple y Airbnb (flujo y sensación de app), Zara, AllSaints (estética).
- Colores: negro #0A0A0A, blanco #FFFFFF, grises #F5F5F7 / #F4F4F4 / #EDEDED / #A3A3A3, texto secundario #6E6E73. Links en azul #0066CC. Verde #16A34A y rojo #DC2626 solo para estados (disponible, error, favorito). Sin dorado ni color de acento.
- Tres tipografías con rol fijo:
  - Inter: textos para leer, formularios, menú.
  - Instrument Sans (peso 500/600, tracking -0.02em): títulos y precios, con números tabulares.
  - DM Mono en MAYÚSCULAS (letter-spacing 0.06–0.1em, 10–11px): rótulos, etiquetas, códigos de propiedad, zonas.
- Formas: botones y filtros tipo pastilla (radius 999px, alto 44–54px), fotos y cards con radius 14–18px, hojas y paneles 22–30px, campos de formulario 14px con fondo #F5F5F7 que pasa a blanco con borde negro en foco.
- Hojas de vidrio: paneles sobre fondo blanco translúcido con backdrop-filter blur(26px) saturate(1.5). En celular suben desde abajo (bottom sheet); en desktop son panel flotante a la derecha.
- Header fijo translúcido con blur; menú de secciones en pastilla con indicador que se desliza; se esconde al bajar.
- Barra fija abajo en celular con el CTA principal (Consultar / Reservar), respetando safe-area.
- Selector segmentado con pastilla negra que se desliza (operación: Alquilar / Comprar, y tipo de propiedad).
- Animaciones: curva cubic-bezier(0.32,0.72,0,1), 0.2–0.45s, entradas con fade + leve desplazamiento, feedback de press scale(0.97). Respetar prefers-reduced-motion.
- Navegación fluida: cambio de sección sin recargar, el contenido actual se atenúa mientras llega el nuevo. Home y listados en caché con refresco desde el admin.
- Mobile first: 1 columna en celular con fotos de borde a borde, 2 en tablet, 3–4 en desktop. Ancho máximo 1440px, márgenes 16px en celular y 48px en desktop.
- Fotos en máxima calidad, protagonistas. Corazón de favoritos sobre la foto, en círculo de vidrio.
- Evitar: gradientes, colores saturados, sombras pesadas en cards, iconos de estilos mezclados.

## Stack y arquitectura (igual que Member OS)

- Next.js 16 (App Router) + React 19 + TypeScript. Ojo: `params` y `searchParams` son Promises, van con `await`.
- Tailwind CSS 4, PostgreSQL en Railway + Prisma 5, Zustand (favoritos), Cloudinary + next-cloudinary (fotos), Resend + React Email, Mercado Pago (fase posterior), Google Maps, Vercel + Vercel Analytics.
- Estructura de carpetas:
  - `app/(site)/` parte pública: home, propiedades, propiedad/[slug], zonas/[slug], favoritos, cuenta, publicar
  - `app/panel/` panel del propietario
  - `app/admin/` backoffice (una sola carpeta de admin, sin duplicados)
  - `app/api/` endpoints; `app/api/admin` y `app/api/panel` protegidos por middleware
  - `components/site`, `components/panel`, `components/admin`, `components/ui` (componentes base)
  - `lib/` prisma, auth, cloudinary, email, mercadopago, whatsapp, cache
  - `store/` Zustand
  - `scripts/` db-guard, db-backup, db-deploy-prod, db-copy-prod-to-local
  - `docs/`
- Autenticación: admin con NextAuth (usuario y contraseña); usuarios y propietarios con link mágico por mail, sin contraseña.
- `middleware.ts` protege /admin, /panel y sus APIs (401 en API, redirect en páginas).
- SEO desde el inicio: metadata por página, JSON-LD de cada propiedad, imágenes OG generadas, sitemap, páginas por zona, robots y llms.txt.
- Direcciones con la API Georef (provincias y localidades de Argentina).
- Cron en Vercel para vencer reservas sin pagar.

## Roles

- Visitante: busca, filtra, ve propiedades, consulta por WhatsApp o formulario.
- Usuario registrado: guarda favoritos, envía consultas y solicitudes de reserva, deja reseñas.
- Propietario/anfitrión: publica y edita sus propiedades, carga fotos, precios y disponibilidad, recibe consultas.
- Admin: aprueba o rechaza publicaciones, gestiona propiedades, usuarios, consultas, destacados y contenido.

## Funcionalidades

Parte pública:
- Home con buscador: zona, operación (alquiler temporario / anual / venta), tipo (casa, departamento, dúplex, cabaña, lote, local), fechas y cantidad de huéspedes.
- Listado con filtros (precio, ambientes, dormitorios, baños, cocheras, pileta, mascotas, distancia al mar, amenities), orden y vista mapa.
- Ficha de propiedad: galería grande, código, descripción, características, amenities, mapa, calendario de disponibilidad, precio por noche/quincena/mes/temporada o precio de venta, reglas de la casa, perfil del anfitrión, reseñas, propiedades similares.
- Botón de WhatsApp y formulario de consulta en cada ficha.
- Favoritos y lista compartible.
- Páginas por zona (SEO local) y blog/novedades.
- Quiénes somos, contacto, términos.

Panel del propietario:
- Publicar propiedad en pasos (tipo Airbnb): datos, ubicación en mapa, fotos, amenities, precios, calendario, reglas.
- Estados: borrador, en revisión, publicada, pausada, rechazada.
- Bandeja de consultas y solicitudes de reserva.
- Calendario para bloquear fechas y definir precios por temporada.

Panel admin:
- Moderación de publicaciones.
- ABM de propiedades, zonas, amenities, usuarios.
- Consultas y reservas.
- Propiedades destacadas y contenido de la home.
- Métricas básicas (visitas, consultas, propiedades activas).

## Fases

- Fase 1 (MVP): catálogo público, buscador y filtros, ficha, consulta por WhatsApp y formulario, admin que carga propiedades, SEO base.
- Fase 2: registro de usuarios, publicación por propietarios con moderación, favoritos, mapa.
- Fase 3: calendario de disponibilidad, precios por temporada, solicitud de reserva.
- Fase 4: pago de seña con Mercado Pago, reseñas, perfiles de anfitrión, notificaciones por mail.
- Futuro: WhatsApp Business, mensajería interna, carga de propiedades con IA, sincronización con Airbnb/Booking (iCal), tasaciones online, monetización.

## Reglas de trabajo

- No sobreingenierizar: proponer siempre la solución más simple que funcione.
- Funcionalidades grandes: dividir en fases.
- Antes de escribir código complejo, explicar arquitectura y decisiones técnicas.
- Trabajar paso por paso, sin romper lo que ya funciona.
- Cambios nuevos en rama aparte, nunca push directo a main.
- Responder corto y directo, en español rioplatense.

## Errores a no repetir (pasaron en Member)

- No poner `* { margin: 0; padding: 0 }` en globals.css: anula los espacios de Tailwind y obliga a escribir clases a mano.
- No activar `ignoreBuildErrors` ni `ignoreDuringBuilds`: que el build falle si hay errores de tipos.
- Una sola estructura de admin; nada de carpetas paralelas a medio usar.
- Definir el design system una vez (tokens en `@theme` + componentes base: Boton, Pastilla, Campo, Hoja, Card) y reutilizarlo, en vez de estilos sueltos por pantalla.

## Base de datos (crítico, desde el día uno)

Ver `CLAUDE.md`. Resumen: base local separada de producción, nada de `migrate dev` / `reset` / `db push` contra producción, todo cambio con migración, a producción solo con backup previo y OK explícito.

## Primer entregable

Antes de escribir código, generá la carpeta `/docs` con:

- 01-vision-producto.md
- 02-arquitectura.md
- 03-schema-prisma-v1.md
- 04-ux-ui.md
- 05-design-system.md
- 06-business-rules.md
- 07-user-stories-prd.md
- 08-api-contracts.md
- base-de-datos.md

Después esperá mi OK para arrancar con la Fase 1.
