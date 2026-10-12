# AlquiloPinamar — estado y pendientes

> Última actualización: 11 de octubre de 2026 (Fase 2d-1: panel del propietario).
> Este archivo dice qué está hecho, qué falta y por dónde seguir. Actualizarlo al cerrar cada paso.

## Dónde estamos

Fase 1 (MVP) en curso. Están hechos el proyecto base, el design system, el admin completo de propiedades (con fotos) y la primera versión del sitio público. Faltan terminar el sitio público, las consultas, el SEO y publicar.

| Paso de la Fase 1 | Estado |
|---|---|
| 1. Proyecto base + scripts de base de datos | Hecho, en `main` |
| 2. Design system (componentes base) | Hecho, en `main` |
| 3. Schema Fase 1 + migración inicial + datos iniciales | Hecho, en `main` |
| 4a. Admin: login, zonas y amenities | Hecho y probado, en `main` |
| 4b. Admin: propiedades (listado, formulario, publicar, pausar, duplicar, dar de baja) | Hecho y probado, en `main` |
| 4c. Admin: fotos de las propiedades (subir, ordenar, portada, borrar) | Hecho y probado, en `main` |
| 5. Sitio público: header, home con buscador, listado con filtros, ficha, páginas por zona | Hecho y revisado en celular. PR #4 abierto (`sitio-publico` → `main`), falta que Tommy lo una |
| 6. Consultas: formulario, WhatsApp, mail, bandeja en el admin | Hecho y probado por Tommy. PR #5 abierto (apilado sobre el #4). Falta la cuenta de Resend |
| 7. SEO: metadata, JSON-LD, imágenes OG, sitemap, robots, llms.txt, páginas por zona | Hecho en la rama `seo`, falta la prueba de Tommy |
| 8. Páginas institucionales, métricas, revisión en celular y publicación | **Código hecho en la rama `cierre`.** Falta: prueba de Tommy, revisión legal, datos del titular y publicar (guía en `docs/publicacion.md`) |

## Publicación: estado

**El sitio está publicado (8/10/2026): https://alquilopinamar.vercel.app**

- **Railway:** proyecto `alquilopinamar`, Postgres en US East (Virginia). Migración `init` aplicada, 5 zonas, 12 amenities y usuario del admin de Tommy.
- **Vercel:** proyecto `alquilopinamar`. Solo despliega `main` ("Only build production"). 9 variables solo en Production: 5 de configuración (URL, NextAuth URL, Cloudinary cloud y carpeta, mail del admin) y 4 secretas cargadas por Tommy (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- **Probado en producción:** home, zonas, quiénes somos, 404, sitemap, robots (abierto) y login del admin.
- **`.env.prod-db`** en la Mac de Tommy (permisos 600, ignorado por git).
- Claude no escribe credenciales en formularios web: las claves las carga Tommy.
- Los proyectos de Member en Railway y Vercel no se tocan.

## Por dónde seguir (retomar acá)

Fase 1 publicada. Lo que queda para cerrarla del todo:

1. **Tommy:** entrar a https://alquilopinamar.vercel.app/admin con su usuario de producción y cargar las primeras propiedades reales.
2. **Tommy:** secreto `PROD_DATABASE_URL` en GitHub para el backup diario (Settings → Secrets and variables → Actions).
3. **Hecho (11/10):** clave de Resend propia (`alquilopinamar`, solo envío) en Vercel y en el `.env`. Falta probar que llegue el aviso de una consulta en producción.
4. **Tommy:** clave nueva de Cloudinary (la actual quedó en un chat): actualizarla en Vercel y en el `.env`.
5. **Tommy:** titular del sitio y revisión legal de términos y privacidad; después cargar `NEXT_PUBLIC_TITULAR`, `NEXT_PUBLIC_CUIT`, `NEXT_PUBLIC_DOMICILIO`, `NEXT_PUBLIC_WHATSAPP` y `NEXT_PUBLIC_EMAIL_CONTACTO` en Vercel (Config) y redeploy.
6. Dominio propio, Google Search Console y Content-Security-Policy (ver `docs/publicacion.md`).
7. Después: Fase 2 (registro con link mágico, panel del propietario, favoritos, mapa).

Al pegar una clave en Vercel: correr el comando que la copia, escribir el nombre a mano en Key (no copiarlo) y pegar en Value. Si se copia otra cosa en el medio, se pisa lo copiado.

### Cómo probar el SEO

- `http://localhost:3000/sitemap.xml`: tienen que aparecer la home, los listados, las zonas y cada propiedad publicada con sus fotos.
- `http://localhost:3000/robots.txt`: en local dice `Disallow: /` (bien: solo producción se indexa).
- `http://localhost:3000/llms.txt`: resumen del sitio en texto.
- `http://localhost:3000/opengraph-image` y `http://localhost:3000/zonas/pinamar/opengraph-image`: las imágenes que se ven al compartir.
- Una dirección que no existe (ej. `/propiedad/no-existe`): página 404 propia.
- En una ficha, clic derecho → "Ver código fuente" y buscar `application/ld+json`.
- Después de publicar: pasar una ficha por https://search.google.com/test/rich-results y https://www.opengraph.xyz.

## Lo próximo que tiene que hacer Tommy

1. **Unir los PR #4 y #5** (en ese orden) y **probar el SEO y el paso 8** (ver arriba).
2. **Definir el titular del sitio** (persona o empresa, CUIT y domicilio) y **hacer revisar los términos y la privacidad por un abogado** (ver `docs/publicacion.md` → Textos legales).
3. **Resend: hecho.** Clave propia en Vercel y en el `.env`. Cuando haya dominio, verificarlo en Resend y limitar la clave a ese dominio.
4. **Escribir el texto de cada zona** desde el admin (Zonas → descripción y título para Google): es lo que posiciona las páginas por zona.
5. **Cargar más propiedades reales** (3 o 4, con 5 fotos distintas o más). Hoy hay una sola publicada, la AP-0001.
6. **Cargar un WhatsApp** en la propiedad desde el admin (o definir el del sitio): sin número, la ficha no muestra el botón de WhatsApp.
7. **Pasar el logo en un archivo aparte** si es el definitivo, para ponerlo en el header.
8. **Cambiar la clave de Cloudinary antes de publicar el sitio:** el secret actual quedó escrito en un chat. Generar una nueva en Cloudinary → API Keys, ponerla en el `.env` y borrar la vieja.
9. **Conseguir cuando se pueda:** dominio definitivo y número de WhatsApp del sitio. No frenan el desarrollo.

## Qué está hecho

### Documentación (`docs/`)
Los 9 documentos del primer entregable: visión, arquitectura, schema, UX/UI, design system, reglas de negocio, user stories, contratos de API y reglas de base de datos.

### Proyecto base
- Next.js 16.3.8, React 19, TypeScript estricto, Tailwind 4, Prisma 5.22.
- Estructura de carpetas del `PROMPT.md`.
- `referencia-member/` excluida de TypeScript, ESLint, Tailwind y git.
- Scripts de base: `db-guard`, `db-backup`, `db-deploy-prod`, `db-copy-prod-to-local`.
- Repo privado en GitHub: `thomas209/alquilopinamar`.

### Design system
- Tokens (colores, tipografías, radios, sombras, animaciones, vidrio) en `app/globals.css`.
- Componentes en `components/ui`: Boton, Pastilla, Segmentado, Campo, Hoja, Card, Rotulo, Precio, Icono, Esqueleto.
- Muestrario en `/sistema` (aprobado por Tommy).

### Base de datos
- Schema de la Fase 1 y migración `init` aplicada en la base local.
- `npm run db:seed` carga las 5 zonas y 12 amenities base (ya corrido).

### Admin
- Login en `/admin/login` con usuario y contraseña (usuario de Tommy ya creado en la base local).
- `proxy.ts` protege `/admin` y `/api/admin`.
- Inicio con números, y alta / edición / borrado de zonas y amenities.
- Propiedades: listado con buscador y filtros, formulario completo, publicar, pausar, duplicar y dar de baja.
- Fotos: subida múltiple a Cloudinary, orden (arrastrando o con flechas), portada y borrado.
- Propiedades: listado con buscador y filtros, formulario completo (datos, ubicación, características, amenities, precio, tarifas, reglas, destacado), publicar, pausar, duplicar y dar de baja.

### Sitio público (PR #4)
- Header fijo translúcido con menú en pastilla (Alquilar · Anual · Comprar) que se esconde al bajar, y footer.
- Home: portada con buscador (operación, zona, tipo), destacadas, recién publicadas y zonas. La portada usa la primera foto de la primera destacada.
- Listado `/propiedades`: filtros por operación, zona, tipo, dormitorios, pileta y mascotas, y orden. Todo en la URL.
- Ficha `/propiedad/[slug]`: galería (carrusel en celular, mosaico en desktop, visor a pantalla completa), características, comodidades, tarifas, reglas, similares, tarjeta de precio y barra fija abajo en celular. Botón de WhatsApp solo si hay número.
- "Más filtros" en hoja de vidrio: precio por moneda (USD o $, sin conversión), baños, distancia al mar, cochera y comodidades. "Ver más" de a 24 con el total real.
- Descripción plegable ("Leer más") en la ficha.
- Páginas por zona `/zonas/[slug]`: portada, texto de la zona, accesos por operación con cantidad, propiedades de la zona y otras zonas. La home, el footer y la ficha linkean ahí.
- Archivos: `lib/sitio.ts` (consultas con caché), `lib/busqueda.ts` (filtros ↔ URL), `lib/whatsapp.ts`, `components/site/`.

### Consultas (PR #5)
- Ficha: botón "Consultar" que abre una hoja con el formulario (en alquiler temporario pide fechas y huéspedes; la salida se completa sola con la estadía mínima). Recuerda nombre, mail y teléfono en el navegador. WhatsApp como segundo botón (redondo en la barra del celular).
- `POST /api/consultas`: valida, campo trampa contra robots, máximo 5 por hora por mail o IP (la IP se guarda como hash), solo propiedades publicadas.
- Mail de aviso al admin con Resend + React Email (`emails/ConsultaNuevaEmail.tsx`), con "Responder" directo a quien consultó. Sale después de responder, así la persona no espera; si falla o falta la clave, la consulta se guarda igual.
- `POST /api/propiedades/[slug]/evento`: cuenta visitas (una por sesión) y clics en WhatsApp. Ignora robots.
- Admin `/admin/consultas`: bandeja con pestañas por estado y buscador (nombre, mail o código). Detalle con mensaje, datos, estadía, propiedad, "Responder por mail" / "por WhatsApp" (arma el mensaje y pasa la consulta a Respondida), estado y notas internas. Contador de nuevas en el menú y en el inicio.
- Variables nuevas en `.env.example`: `NEXT_PUBLIC_WHATSAPP`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `RESEND_FROM_EMAIL`.

### SEO (rama `seo`)
- `lib/seo.ts`: `metadataDePagina()` arma la metadata completa de cada página (título, descripción de hasta 160 caracteres, canónica, Open Graph y tarjeta de X). Hace falta porque en Next, si una página define `openGraph`, pierde la imagen, el nombre del sitio y el idioma del layout.
- Ficha: título con operación y zona; descripción con precio y datos clave; foto de portada para compartir; JSON-LD `RealEstateListing` (precio, características, comodidades; sin dirección exacta, coordenadas solo si el dueño eligió mostrar el punto) y migas de pan.
- Listado: se indexan solo operación, zona y tipo. Con otros filtros (precio, comodidades, orden, "Ver más") va `noindex` y la canónica sin esos filtros.
- Zonas: imagen para compartir generada con la foto de la zona y su nombre; JSON-LD con migas de pan y lista de propiedades.
- Home: imagen genérica del sitio y JSON-LD del sitio y la organización.
- `sitemap.xml` (con fotos), `robots.txt` (fuera de producción todo cerrado; en producción cierra admin, panel, API y `/sistema`), `llms.txt`, páginas 404 propias.
- Tipografías para las imágenes en `assets/fonts/` (licencia OFL).

### Paso 8 (rama `cierre`)
- Páginas `/nosotros`, `/contacto` (WhatsApp, mail, "Publicá tu propiedad" en 3 pasos y consejos de seguridad), `/terminos` y `/privacidad` (Ley 25.326 con la leyenda obligatoria de la AAIP, y Ley 24.240). Datos de contacto y del titular en `lib/empresa.ts`, desde variables de entorno.
- Footer en 4 columnas con quiénes somos, contacto, publicar y legales. Link a privacidad en el formulario de consulta.
- Admin: inicio con métricas (consultas 7/30 días, visitas, clics en WhatsApp, propiedades con más interés y tasa de interés, últimas consultas).
- Cabeceras de seguridad (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy) y sin `X-Powered-By`. `/sistema` da 404 en producción.
- Backup diario automático: `.github/workflows/db-backup.yml` (`pg_dump` + JSON, 90 días). Se activa con el secreto `PROD_DATABASE_URL`.
- `npm run db:preparar-prod`: carga zonas, amenities y el usuario del admin en producción (backup + confirmación, solo inserta).
- `docs/publicacion.md`: la guía completa para publicar (Railway, Vercel, dominio, Resend, backups, Google y prueba final).

## Qué falta desarrollar

### Fase 1 — lo que queda
- **Hecho (PR #12):** Admin > Contenido con la portada de la home y de cada zona (se sube a Cloudinary en `alquilopinamar/portadas/`; si no hay, se usa la foto de la primera propiedad). En el admin de propiedades el punto se elige tocando el mapa. La ficha tiene la sección Ubicación con mapa: círculo aproximado salvo que se marque "mostrar ubicación exacta"; las coordenadas reales no salen del servidor. Mapas con MapLibre + OpenFreeMap (gratis, sin clave; CARTO pasó a pedir clave y se reemplazó en el PR #14).
- **En la Mac:** después de `git pull` correr `npm install` (el mapa usa `maplibre-gl`).
- **Cierre:** prueba completa en celular con datos reales; Content-Security-Policy (permitir `tiles.openfreemap.org` y `blob:` en worker-src para el mapa).
- **Publicación:** dominio definitivo, Google Search Console.

### Fase 2
- **2a Favoritos (hecho, PR #16):** corazón en cards y ficha, contador en el header, `/favoritos` (con "Ya no disponibles") y lista compartible `/lista?de=Nombre&p=slugs` con imagen para WhatsApp. En el navegador, sin cuenta (zustand, máximo 40).
- **2b Vista mapa (hecho, PR #17):** botón flotante "Ver mapa / Ver lista" en `/propiedades` (`?vista=mapa`, noindex). Pines con precio corto; al tocar uno, tarjeta abajo. En desktop, lista a la izquierda que cambia al mover el mapa. Usa la ubicación pública (aproximada salvo punto exacto); las que no tienen punto no aparecen y se avisa.
- **2c Cuentas (rama `fase2c-cuentas`, PR abierto, falta la prueba de Tommy):** ingreso con link mágico en `/cuenta/ingresar` (vence a los 15 min, un solo uso, se guarda el hash). El link lleva a `/cuenta/entrar` con un botón "Entrar" (así los antivirus del mail no lo gastan). La cuenta se crea al usar el link. Sesión con cookie firmada de 30 días (`ap_sesion`), separada del admin. `/cuenta`: datos (nombre, apellido, teléfono, WhatsApp), consultas hechas (por cuenta o por el mismo mail) y cerrar sesión. Header con acceso a la cuenta. El formulario de consulta se completa con los datos de la cuenta y la consulta queda asociada. Límite: 3 links cada 15 min por mail y 10 por hora por IP. Migración `20261011220000_usuarios` (tablas `User` y `LoginToken`, `Inquiry.userId`): aplicar en local con `npm run db:migrate`; a producción solo con backup y OK de Tommy.
- **Ojo Resend:** sin dominio verificado los links solo llegan a thomascaronia@gmail.com. Para que entren otras personas hace falta el dominio (ver `docs/publicacion.md`).
- **2d-1 Panel del propietario (rama `fase2d-panel`):** `/panel/propiedades` (mis propiedades con estado y motivo de rechazo) y asistente en 9 pasos (qué, descripción, características, ubicación, fotos, comodidades, precio, reglas y contacto, revisión) para crear y editar. Se guarda como borrador al pasar de paso. Enviar a revisión pide la propiedad completa y nombre + teléfono/WhatsApp en la cuenta. Publicada: edita al instante; cambios de título, descripción o fotos quedan "Cambios sin revisar" en el admin. Pausar/reanudar y eliminar. El proxy protege `/panel` y `/api/panel`. En el admin: se ve el propietario y se aprueba con "Guardar y publicar". Migración `20261011230000_propietarios` (solo agrega 3 columnas a Property).
- **Cuando haya dominio:** cambiar "Publicá tu propiedad" de `/contacto` y del footer para que lleve a `/panel/propiedades/nueva` (hoy siguen por WhatsApp porque los links de ingreso solo llegan a Tommy).
- **Disponibilidad por períodos (misma rama, PR #21):** como en las inmobiliarias de la costa. El propietario (o el admin) carga períodos de temporada (botón "Cargar temporada de verano": enero y febrero completos y por quincena) con precio, valor por día y estado Disponible/Alquilado. En la ficha: "Disponibilidad y precios" en tarjetas (deslizables en el celular), lo pisado por un alquilado sale "No disponible", "Actualizada el …", y tocar uno disponible abre la consulta con esas fechas. Acceso rápido "Disponibilidad" en Mis propiedades. Migración `20261012000000_disponibilidad` (solo agrega).
- **Siguiente:** 2d-2 consultas del propietario, 2e moderación.
Registro con link mágico, panel del propietario (publicar en pasos, editar, pausar, bandeja de consultas), moderación en el admin, favoritos y lista compartible, vista mapa, novedades.

### Fase 3
Calendario de disponibilidad, precios por temporada, búsqueda por fechas real, solicitud de reserva.

### Fase 4
Seña con Mercado Pago, reseñas, perfil de anfitrión, mails de notificación.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Operación | Una publicación = una operación. Venta y alquiler de la misma casa son dos publicaciones (botón "Duplicar") |
| Monedas | USD o ARS por publicación, sin conversión |
| Ubicación | Dirección exacta privada; el mapa muestra zona aproximada salvo que se elija el punto exacto |
| Publicar | Mínimo 5 fotos (3 en lotes), descripción de 100 caracteres o más, sin teléfonos, mails ni links |
| WhatsApp | El de la publicación; si no tiene, el del sitio |
| Favoritos | En el navegador, sin cuenta y sin tabla |
| Propietarios (Fase 2) | Misma cuenta que el usuario; publican gratis y sin tope; primera publicación con revisión |
| Reservas (Fase 3) | La solicitud no bloquea fechas; se bloquean al aceptar; 48 h para responder |
| Seña (Fase 4) | Propuesta: 30 % y 24 h para pagarla (a confirmar) |
| Next.js | 16.3.8 y no la 16.2.9 de Member, que tiene avisos de seguridad críticos |
| Protección de rutas | Archivo `proxy.ts` (en Next 16 reemplaza a `middleware.ts`) |
| `referencia-member` | Fuera de git: tiene el código de Member y datos bancarios |
| Cloudinary | Misma cuenta que Member (`dklvmlzds`), con clave propia `alquilopinamar` (rol Master Admin). Todo va a la carpeta `alquilopinamar/propiedades/AP-xxxx/`; el código no sube ni borra nada fuera de `alquilopinamar/`. Comparten el cupo del plan gratis |
| Fotos | Van directo del navegador a Cloudinary con firma del servidor, en calidad original. Hasta 10 MB cada una y 40 por propiedad. Una publicada no puede quedar con menos del mínimo |

## Datos de esta Mac

- Base local: Postgres.app en el **puerto 5433**, base `alquilopinamar_dev`. El puerto 5432 lo usa otro Postgres que ya estaba instalado: no tocarlo.
- `.env` (no se sube a git): `DATABASE_URL`, `NEXT_PUBLIC_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Y las de Cloudinary: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_FOLDER`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Nada de este proyecto toca Member: ni su carpeta, ni su repo, ni su base, ni sus cuentas.

## Comandos de todos los días

```bash
cd ~/Desktop/alquilopinamar
npm run dev          # levanta el sitio en http://localhost:3000
```

- Sitio: `http://localhost:3000`
- Design system: `http://localhost:3000/sistema`
- Admin: `http://localhost:3000/admin`

## Cómo se trabaja

- Cada paso en una rama aparte; se une a `main` con un pull request desde GitHub. Nunca push directo a `main`.
- Los cambios de tablas se hacen primero en la base local con `npm run db:migrate`. A producción solo con `npm run db:deploy-prod`, con backup y OK de Tommy (ver `docs/base-de-datos.md`).
- Claude escribe el código y lo verifica; lo que toca la base o hay que instalar se prueba en la Mac de Tommy.

## Pendientes menores

- `npm audit` marca 5 avisos "high" en `braces` (cadena de `eslint-config-next`). Es solo la herramienta de revisión de código: no viaja al sitio. No hay versión arreglada todavía; **no correr `npm audit fix --force`** (baja Next a la 14). Revisar cuando salga `braces` > 3.0.3.
- MapLibre 6 se sirve con su worker copiado a `public/vendor/` por `scripts/maplibre-worker.mjs` (corre en install, dev y build).

- Actualizar Next en **Member** (sigue en 16.2.9, con avisos críticos). Es un tema de Member, no de este proyecto.
- Sacar `referencia-member/` de la carpeta cuando ya no se consulte.
