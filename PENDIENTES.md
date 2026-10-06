# AlquiloPinamar — estado y pendientes

> Última actualización: 6 de octubre de 2026.
> Este archivo dice qué está hecho, qué falta y por dónde seguir. Actualizarlo al cerrar cada paso.

## Dónde estamos

Fase 1 (MVP) en curso. Están hechos el proyecto base, el design system y el admin completo de propiedades, con fotos. Falta toda la parte pública y publicar el sitio.

| Paso de la Fase 1 | Estado |
|---|---|
| 1. Proyecto base + scripts de base de datos | Hecho, en `main` |
| 2. Design system (componentes base) | Hecho, en `main` |
| 3. Schema Fase 1 + migración inicial + datos iniciales | Hecho, en `main` |
| 4a. Admin: login, zonas y amenities | Hecho y probado, en `main` |
| 4b. Admin: propiedades (listado, formulario, publicar, pausar, duplicar, dar de baja) | Hecho y probado, en `main` |
| 4c. Admin: fotos de las propiedades (subir, ordenar, portada, borrar) | Hecho y probado, en la rama `admin-fotos` (falta unirla a `main`) |
| 5. Sitio público: header, home con buscador, listado con filtros, ficha | **Siguiente** |
| 6. Consultas: formulario, WhatsApp, mail, bandeja en el admin | Pendiente |
| 7. SEO: metadata, JSON-LD, imágenes OG, sitemap, robots, llms.txt, páginas por zona | Pendiente |
| 8. Páginas institucionales, métricas, revisión en celular y publicación | Pendiente |

## Lo próximo que tiene que hacer Tommy

1. **Unir la rama `admin-fotos` a `main`** con un pull request en GitHub (Claude lo crea; el *Merge* lo hace Tommy).
2. **Cargar 3 o 4 propiedades reales con 5 fotos o más y publicarlas**, para armar y probar el sitio público con contenido real.
3. **Cambiar la clave de Cloudinary antes de publicar el sitio:** el secret actual quedó escrito en un chat. Generar una nueva en Cloudinary → API Keys, ponerla en el `.env` y borrar la vieja.
4. **Conseguir cuando se pueda:** dominio definitivo, número de WhatsApp del sitio y logo. No frenan el desarrollo.

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

## Qué falta desarrollar

### Fase 1 — lo que queda
- **Fotos de las propiedades:** subida múltiple a Cloudinary, orden arrastrando, portada. Hasta que estén, ninguna propiedad se puede publicar (la regla pide 5 fotos). Al sumarlas, hacer que "Duplicar" copie también las fotos.
- **Admin:** editar el hero de la home; elegir punto en el mapa en vez de escribir latitud y longitud.
- **Sitio público:** header y menú en pastilla, home con buscador, listado con filtros y orden, ficha con galería y barra fija de consulta, páginas por zona.
- **Consultas:** formulario en hoja, botón de WhatsApp, mail de aviso (Resend), bandeja en el admin.
- **SEO:** metadata por página, JSON-LD, imágenes OG, sitemap, robots, llms.txt.
- **Cierre:** quiénes somos, contacto, términos, métricas básicas, prueba completa en celular.
- **Publicación:** proyecto en Vercel, base nueva en Railway (nunca la de Member), variables de entorno, `npm run db:deploy-prod`, backup diario con GitHub Actions, dominio.

### Fase 2
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

- Actualizar Next en **Member** (sigue en 16.2.9, con avisos críticos). Es un tema de Member, no de este proyecto.
- Sacar `referencia-member/` de la carpeta cuando ya no se consulte.
- Borrar la página `/sistema` o dejarla solo para desarrollo antes de publicar.
