# AlquiloPinamar — estado y pendientes

> Última actualización: 12 de octubre de 2026.
> Este archivo dice qué está hecho, qué falta y por dónde seguir. Actualizarlo al cerrar cada paso.

## Dónde estamos

**Sitio publicado:** https://alquilopinamar.vercel.app (Vercel publica solo `main`; base en Railway).

Fase 1 (MVP) publicada. De la Fase 2 están publicados: cuentas con link mágico, panel del propietario, favoritos, vista mapa, y la disponibilidad completa de alquiler temporario (períodos, fechas ocupadas, noches sueltas, calendario para elegir fechas y tarjeta de reserva estilo Airbnb).

| Paso | Estado | PR |
|---|---|---|
| Fase 1: proyecto, design system, admin, sitio público, consultas, SEO, legales, publicación | Publicado | #4 a #13 |
| 2a Favoritos y lista compartible | Publicado | #16 |
| 2b Vista mapa en el listado | Publicado | #17 |
| Arreglos: fotos de las cards, cambios sin guardar en el admin | Publicado | #18, #19 |
| 2c Cuentas con link mágico (`/cuenta`) | Publicado 11/10 | #20 |
| 2d-1 Panel del propietario: publicar en 9 pasos, mis propiedades, estados | Publicado 11/10 (sin probar a fondo por Tommy) | #21 |
| Disponibilidad por períodos + fechas ocupadas + noches sueltas | Publicado 12/10 | #21, #22 |
| "Elegí tus fechas": calendario con total por noche | Publicado 12/10 | #23 |
| Ficha estilo Airbnb: tarjeta de reserva, limpieza y depósito, destacados, compartir | Publicado 12/10 | #24 |
| 2d-2 Consultas del propietario | **Siguiente** | — |

### Migraciones aplicadas en producción (todas solo agregan)

`init` · `usuarios` · `propietarios` · `disponibilidad` · `fechas_ocupadas` · `costos_extra`. Cada una con backup antes y después (`npm run db:deploy-prod`).

## Lo que hicimos el 11 y 12 de octubre

- **Resend:** clave propia `alquilopinamar` (solo envío) en la misma cuenta que Member, sin tocar la de Member. Cargada en Vercel y en el `.env`. La primera clave quedó expuesta en el chat y se reemplazó.
- **2c Cuentas:** ingreso sin contraseña con link al mail (`/cuenta/ingresar` → mail → `/cuenta/entrar` con botón "Entrar"). `/cuenta` con datos y consultas. El header muestra la cuenta. Las consultas se completan solas con los datos de la cuenta.
- **2d-1 Panel del propietario:** `/panel/propiedades` y asistente en pasos (qué, descripción, características, ubicación, fotos, comodidades, precio, disponibilidad, reglas y contacto, revisión). Enviar a revisión, retirar, pausar, reanudar y eliminar. En el admin se ve el propietario y "Cambios sin revisar"; se aprueba con "Guardar y publicar".
- **Disponibilidad (como se alquila en la costa):**
  - El propietario carga **períodos** con su nombre ("Enero completo", "1ra quincena de enero"…), con precio del período y **precio por noche** para las noches sueltas. El botón "Cargar temporada de verano" arma enero y febrero.
  - Marca lo **ocupado por fechas** en un calendario (entrada y salida), o con el atajo "Alquilado / Liberar" de cada período. Está en el panel, en el acceso rápido de Mis propiedades y en el admin.
  - En la ficha, los períodos se agrupan por mes con estado **Disponible / Alquilado en parte (con las noches libres y su total) / Alquilado**.
- **Elegí tus fechas:** calendario en la ficha para elegir entrada y salida sobre días libres, con el total. Los períodos que entran enteros se cobran a su precio; el resto, noche por noche (la quincena antes que el mes); si no hay período, el precio base.
- **Ficha estilo Airbnb:**
  - Tarjeta de reserva a la derecha: llegada, salida y huéspedes sincronizados con el calendario, desglose, limpieza final y total, y el depósito en garantía aparte. Sin fechas, muestra el "Próximo disponible".
  - Barra del celular con el total.
  - Destacados automáticos ("A 100 m del mar"…) y botón Compartir.
- **AP-0001 con datos de ejemplo:** temporada cargada (precios del ejemplo de Balmoral y precios por noche inventados), 1 al 10 de enero ocupado y la 2da quincena de enero alquilada. **Hay que reemplazarlos por los reales.**

## Por dónde seguir (retomar acá)

### Lo que tiene que hacer Tommy

1. **Probar el panel del propietario** de punta a punta: `/cuenta` → "Publicar mi propiedad" → 10 pasos → enviar a revisión → aprobar desde el admin.
2. **Mirar la ficha en el celular:** elegir fechas y ver que la barra de abajo muestre el total.
3. **AP-0001:** cargar los precios reales, los precios por noche, la limpieza y el depósito, los huéspedes reales (hoy dice 2) y una descripción real.
4. **Probar el aviso de consulta por mail** en producción (Resend): hacer una consulta y ver que llegue a thomascaronia@gmail.com.
5. **Dominio propio** y verificarlo en Resend. Sin dominio, los links de ingreso y los avisos solo llegan a Tommy, así que el panel todavía no se puede abrir a otros propietarios. Con dominio: cambiar "Publicá tu propiedad" de `/contacto` y del footer para que lleve a `/panel/propiedades/nueva`.
6. **Clave nueva de Cloudinary** (la actual quedó escrita en un chat) en Vercel y en el `.env`.
7. **Secreto `PROD_DATABASE_URL` en GitHub** para el backup diario automático.
8. **Titular del sitio y revisión legal** de términos y privacidad; después cargar `NEXT_PUBLIC_TITULAR`, `NEXT_PUBLIC_CUIT`, `NEXT_PUBLIC_DOMICILIO`, `NEXT_PUBLIC_WHATSAPP` y `NEXT_PUBLIC_EMAIL_CONTACTO` en Vercel.
9. **Cargar más propiedades reales** (hoy hay una sola).
10. Borrar en GitHub la rama vieja `cuentas` (intento abandonado del 10/10, nunca se unió).

### Lo que sigue en código (en orden)

1. **2d-2 Consultas del propietario:** `/panel/consultas` con su bandeja (responder por mail o WhatsApp, marcar respondida) y aviso por mail al dueño de cada consulta nueva.
2. **Buscador por fechas y huéspedes en el listado:** mostrar solo lo libre en esas fechas, con el total, y la etiqueta "Libre: 2da Ene" en las cards.
3. **2e Moderación en el admin:** cola de "En revisión", aprobar o rechazar con motivo y aviso por mail.
4. **Más de la ficha estilo Airbnb:** "Dónde vas a dormir" (camas por dormitorio), "Qué hay cerca" (playa, centro, súper), perfil del anfitrión y todas las comodidades en una hoja.
5. **Disponibilidad al día:** aviso si no se actualiza hace 30 días; "Copiar la temporada pasada".
6. **Fase 3 Reservas:** el botón "Reservar" en la tarjeta y en el calendario → solicitud → el dueño acepta → se bloquean las fechas.
7. **Fase 4:** seña con Mercado Pago, reseñas, perfil de anfitrión, mails de notificación.
8. **Publicación:** Content-Security-Policy, Google Search Console y dominio.

### Cómo publicar un cambio con migración (lo que venimos haciendo)

1. Claude abre el PR.
2. Tommy, en la Mac: `git fetch origin && git checkout <rama> && git pull` y después `npm run db:deploy-prod`, escribiendo exactamente `APLICAR EN PRODUCCION`.
3. Claude une el PR y Vercel publica.

En la Mac, después: `git checkout main && git pull` (y `npm install` si cambió algo).

### Cómo probar el SEO

- `http://localhost:3000/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/opengraph-image`.
- En una ficha: "Ver código fuente" y buscar `application/ld+json`.
- Después de publicar: https://search.google.com/test/rich-results y https://www.opengraph.xyz.

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

### Fase 2 (publicada)
- **2a Favoritos (PR #16)** y **2b Vista mapa (PR #17)**.
- **2c Cuentas (PR #20):** `lib/usuarios.ts`, `lib/sesion.ts` (cookie firmada `ap_sesion`, 30 días), tablas `User` y `LoginToken`.
- **2d-1 Panel (PR #21):** `app/panel/`, `components/panel/Asistente.tsx`, `lib/panel.ts`, fotos compartidas con el admin en `lib/fotos.ts`. El proxy protege `/panel` y `/api/panel`.
- **Disponibilidad (PR #21, #22, #23):** `lib/disponibilidad.ts` (estados, noches libres, cotización), `lib/ocupado.ts`, `components/panel/CalendarioOcupado.tsx`, `components/panel/EditorPeriodos.tsx`, `components/site/DisponibilidadPrecios.tsx`. Tabla `AvailabilityBlock`.
- **Ficha estilo Airbnb (PR #24):** `components/site/TarjetaReserva.tsx`, `store/fechas.ts` (fechas compartidas en la ficha), `lib/destacados.ts`, `components/site/Compartir.tsx`.

## Qué falta desarrollar

Ver "Lo que sigue en código" arriba. Fase 3: reservas (solicitud, aceptar, bloquear fechas, cron que vence las no pagadas). Fase 4: seña con Mercado Pago, reseñas, perfil de anfitrión, mails.

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
| Ingreso de usuarios | Link mágico por mail (15 min, un solo uso); el link abre una página con botón "Entrar" para que los antivirus del mail no lo gasten |
| Disponibilidad | Períodos con nombre (mes, quincenas) + fechas ocupadas por día. Estado de cada período calculado: Disponible / Alquilado en parte / Alquilado |
| Precio de las noches | Período entero a su precio; noches sueltas al precio por noche del período más corto que las contiene; si no, el precio base. Limpieza se suma; depósito aparte |
| Panel abierto a otros | Recién cuando haya dominio verificado en Resend |

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
