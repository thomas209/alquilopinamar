# 02 — Arquitectura

> Mismo stack y misma forma que Member OS, corrigiendo lo que salió mal ahí.

## Decisiones de base

| Decisión | Por qué |
|---|---|
| **Monolito Next.js** (web pública + panel + admin + API en un solo proyecto) | Un deploy, un repo, un dominio. Es lo que ya funciona en Member |
| **Server Components leen de Prisma directo** | Las páginas públicas no pasan por la API propia: menos código y mejor SEO |
| **API (`app/api`) solo para escribir y para lo que pide el navegador** | Formularios, panel, admin, mapa, favoritos, webhooks |
| **Caché con etiqueta + refresco desde el admin** | Home y listados responden al instante; al guardar en admin/panel se invalida (patrón `lib/storeCache.ts`) |
| **Dos sistemas de sesión separados** | Admin con NextAuth; usuarios/propietarios con link mágico y cookie firmada. Un problema en uno no rompe el otro |
| **Un design system único** | Tokens en `@theme` + componentes base en `components/ui`. Nada de estilos sueltos por pantalla |

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript estricto |
| Estilos | Tailwind CSS 4 (tokens en `@theme`) |
| Base | PostgreSQL en Railway + Prisma 5 |
| Estado en cliente | Zustand (favoritos) |
| Fotos | Cloudinary + next-cloudinary |
| Mail | Resend + React Email |
| Pagos | Mercado Pago (Fase 4) |
| Mapas | Google Maps (embed en ficha en Fase 1; Maps JS en Fase 2) |
| Direcciones | API Georef (datos.gob.ar), vía proxy propio |
| Hosting | Vercel + Vercel Analytics + Vercel Cron |

Next 16: `params` y `searchParams` son Promises y van con `await`.

## Estructura de carpetas

```
app/
  (site)/                  parte pública
    page.tsx               home
    propiedades/           listado con filtros (+ vista mapa en F2)
    propiedad/[slug]/      ficha
    zonas/[slug]/          página por zona (SEO local)
    favoritos/  lista/     favoritos y lista compartida
    cuenta/  cuenta/ingresar/
    publicar/              landing para dueños (F2 lleva al panel)
    nosotros/ contacto/ terminos/
    novedades/ novedades/[slug]/   (F2)
  panel/                   panel del propietario (F2+)
  admin/                   backoffice — UNA sola carpeta
    login/
  api/
    auth/[...nextauth]/    admin
    auth/usuario/          request-link, verify, logout, me
    consultas/  favoritos/  georef/  og/
    panel/                 protegido (cookie de usuario)
    admin/                 protegido (NextAuth)
    cron/vencer-reservas/  (F3)
    webhooks/mercadopago/  (F4)
  sitemap.ts  robots.ts  layout.tsx  globals.css
components/
  ui/        Boton, Pastilla, Campo, Hoja, Card, Segmentado, Rotulo, Precio, Icono
  site/      PropertyCard, Galeria, Buscador, Filtros, FavHeart, FavSheet, NavPill, MobileNav, BarraCTA
  panel/     pasos de publicación, calendario
  admin/     tablas, formularios, ImageUpload
emails/      React Email
lib/         prisma, auth, userAuth, cloudinary, email, whatsapp, cache, georef, seo, mercadopago (F4)
store/       favorites.ts
scripts/     db-guard, db-backup, db-deploy-prod, db-copy-prod-to-local
prisma/      schema.prisma, migrations/, seed.ts, create-admin.ts
docs/
public/      llms.txt, íconos
middleware.ts
```

`referencia-member/` queda fuera de TypeScript, ESLint y Tailwind (`exclude` en tsconfig, `ignores` en eslint, `@source not` en globals.css) y se saca del repo cuando el design system propio esté armado.

## Qué se copia de Member y con qué cambios

| Archivo de referencia | Destino | Cambios |
|---|---|---|
| `middleware.ts` | `middleware.ts` | Suma `/panel` y `/api/panel` (cookie de usuario). 401 en API, redirect en páginas |
| `lib/customerAuth.ts` | `lib/userAuth.ts` | Cookie `ap_session`, modelo `User`. **Sin secreto por defecto**: si falta la variable, falla. El token del link se guarda hasheado |
| `lib/cloudinary.ts` | igual | Carpeta `alquilopinamar/propiedades`. Sin recorte 4:5 ni relleno: se sube la foto original (límite 2560 px de lado mayor) y se transforma al mostrar |
| `lib/email.ts` | igual | Solo el patrón (Resend + `RESEND_FROM_EMAIL`); plantillas nuevas |
| `lib/whatsapp.ts` | igual | Tal cual |
| `lib/storeCache.ts` | `lib/cache.ts` | Etiqueta `sitio`, función `refrescarSitio()` |
| `scripts/db-backup.mjs` | igual | Ver nota abajo |
| `app/api/georef/localidades` | igual | Tal cual |
| `store/favorites.ts` | igual | Sin talles: `{ slug }`. Se mantiene el link compartible |
| `app/robots.ts`, `app/sitemap.ts`, `public/llms.txt` | igual | Rutas y textos propios |

**Scripts de base:** en `referencia-member/scripts/` solo venía `db-backup.mjs`. `db-guard`, `db-deploy-prod` y `db-copy-prod-to-local` se escribieron para este proyecto según `base-de-datos.md`.

**Versión de Next:** se usa la última 16.x con parches de seguridad (16.3.8), no la 16.2.9 de Member, que tiene avisos críticos publicados.

**A verificar al implementar:**
- `lib/auth.ts` de la referencia usa la forma de NextAuth v5 pero el paquete instalado es v4 y el middleware usa `getToken` de v4. Acá se elige una sola versión y se usa de punta a punta.
- Next 16 renombra `middleware.ts` a `proxy.ts`. El prompt pide `middleware.ts`; se confirma cuál usar al crear el proyecto.
- El middleware valida la cookie de usuario con Web Crypto (HMAC) para que funcione en cualquier runtime.

## Autenticación

| Quién | Cómo | Sesión |
|---|---|---|
| Admin | NextAuth, usuario y contraseña (bcrypt), tabla `AdminUser` | JWT de NextAuth |
| Usuario / propietario | Link mágico por mail, sin contraseña. Token de un solo uso, vence a los 15 min | Cookie `ap_session` httpOnly firmada con HMAC, 30 días |

`middleware.ts`:

| Ruta | Requiere | Sin sesión |
|---|---|---|
| `/admin/*` (menos `/admin/login`) | Admin | Redirect a `/admin/login` |
| `/api/admin/*` | Admin | 401 JSON |
| `/panel/*` | Usuario | Redirect a `/cuenta/ingresar?volver=…` |
| `/api/panel/*` | Usuario | 401 JSON |

El middleware solo verifica que haya sesión. **Que el recurso sea del usuario se verifica en cada endpoint del panel** (`property.ownerId === userId`).

## Datos y caché

- Páginas públicas: Server Components + `unstable_cache` con etiqueta `sitio` (listado 60 s, auxiliares 300 s).
- Cualquier guardado en admin o panel que afecte lo público llama a `refrescarSitio()`.
- Disponibilidad y precios por fecha (F3) **no** se cachean.
- Contadores de vistas y clics a WhatsApp: llamada liviana desde el cliente, fuera del render cacheado.

## Fotos

- Subida desde admin/panel a Cloudinary, guardando `url`, `publicId`, ancho y alto.
- Se guarda el original en alta; el recorte y el formato se resuelven al mostrar (`f_auto`, calidad alta, tamaños por `sizes`).
- La primera foto en el orden es la portada.

## SEO (desde Fase 1)

- `metadata` por página (`generateMetadata` en ficha y zona).
- JSON-LD por ficha (inmueble + oferta + migas) y en home (organización + buscador).
- Imágenes OG generadas (ficha, zona, lista compartida).
- `sitemap.ts` con home, listados por operación, zonas y fichas publicadas.
- `robots.ts` (bloquea `/admin`, `/panel`, `/api`, `/cuenta`) y `public/llms.txt`.
- Páginas por zona con texto propio editable desde el admin.

## Cron

`vercel.json` → `/api/cron/vencer-reservas`, protegido con `CRON_SECRET`. En el plan Hobby corre una vez por día, así que el vencimiento **también se evalúa al leer** la reserva (si `expiresAt` ya pasó, se trata como vencida).

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Base **local** (`.env`). Nunca la de producción |
| `PROD_DATABASE_URL` | Solo en `.env.prod-db` y en Vercel |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Admin |
| `SESSION_SECRET` | Firma de la cookie de usuario |
| `NEXT_PUBLIC_URL` | URL pública del sitio |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Fotos |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Mails |
| `NEXT_PUBLIC_WHATSAPP` | Número del sitio por defecto |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Mapas (F2) |
| `CRON_SECRET` | Cron (F3) |
| `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | Mercado Pago (F4) |

## Calidad y despliegue

- `next.config.ts` **sin** `ignoreBuildErrors` ni `ignoreDuringBuilds`: si hay errores de tipos, el build falla.
- Ramas: todo cambio en rama creada desde `origin/main`; nunca push directo a main. Antes de un push, `git log origin/main..HEAD`.
- Vercel despliega previews por rama y producción desde main.
- Las migraciones se aplican a producción **antes** de que salga el código que las usa (ver `base-de-datos.md`).

## Qué queda fuera de la arquitectura por ahora

Colas, búsqueda con motor externo, microservicios, websockets, app nativa, multi-tenant. Postgres con buenos índices alcanza para el volumen de la zona.
