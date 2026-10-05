# 07 — User stories y PRD

> Cada historia tiene fase y criterio de aceptación. Una fase está terminada cuando todas sus historias pasan en celular y en desktop.

## Fase 1 — MVP

### Visitante

| # | Historia | Criterio de aceptación |
|---|---|---|
| V1 | Quiero buscar desde la home por operación, zona y tipo | El buscador lleva a `/propiedades` con esos filtros en la URL |
| V2 | Quiero indicar fechas y huéspedes al buscar alquiler temporario | Filtra por capacidad; las fechas llegan a la ficha y precargan la consulta (todavía no filtran disponibilidad) |
| V3 | Quiero filtrar por precio, ambientes, dormitorios, baños, cocheras, pileta, mascotas, distancia al mar y amenities | Cada filtro cambia los resultados sin recargar; el botón Filtrar muestra cuántos hay activos; se pueden limpiar |
| V4 | Quiero ordenar los resultados | Destacadas, más nuevas, precio menor, precio mayor |
| V5 | Quiero ver una ficha completa | Galería, código, descripción, características, amenities, mapa de zona, precio y tarifas, reglas, similares |
| V6 | Quiero consultar por WhatsApp | Abre WhatsApp con mensaje armado (código, título, link) |
| V7 | Quiero consultar por formulario | Con nombre, mail y mensaje se guarda la consulta, veo confirmación y el admin recibe un mail |
| V8 | Quiero ver propiedades por zona | `/zonas/[slug]` muestra texto de la zona y sus propiedades |
| V9 | Quiero compartir una ficha | El link muestra vista previa con foto, título y precio |
| V10 | Quiero que ande rápido en el celular | Listado y ficha se ven completos sin saltos; las fotos cargan progresivas en alta |

### Admin

| # | Historia | Criterio de aceptación |
|---|---|---|
| A1 | Quiero entrar con usuario y contraseña | `/admin/*` redirige al login sin sesión; la API responde 401 |
| A2 | Quiero cargar una propiedad con todos sus datos | Formulario con datos, ubicación, fotos, amenities, precio y tarifas, reglas |
| A3 | Quiero subir varias fotos y ordenarlas | Subida múltiple, arrastrar para ordenar, la primera es portada |
| A4 | Quiero publicar, pausar, duplicar y dar de baja | El cambio se ve en el sitio enseguida (refresco de caché) |
| A5 | Quiero administrar zonas y amenities | ABM con orden y activo/inactivo |
| A6 | Quiero ver y gestionar consultas | Lista con filtros por estado, notas internas, marcar respondida |
| A7 | Quiero destacar propiedades y editar el hero de la home | Elegir destacadas y su orden; cambiar foto y textos del hero |
| A8 | Quiero ver números básicos | Propiedades activas, consultas de la semana, fichas más vistas |

### SEO

| # | Historia | Criterio de aceptación |
|---|---|---|
| S1 | Cada página tiene título y descripción propios | Ficha, zona y listados generan su metadata |
| S2 | Cada ficha tiene datos estructurados | JSON-LD válido |
| S3 | Hay sitemap, robots y llms.txt | El sitemap lista solo propiedades publicadas; robots bloquea admin, panel, api y cuenta |
| S4 | Las fichas tienen imagen para compartir | Imagen OG generada |

## Fase 2 — Usuarios, propietarios, favoritos, mapa

| # | Historia | Criterio de aceptación |
|---|---|---|
| U1 | Quiero entrar con mi mail, sin contraseña | Recibo un link válido 15 min, de un solo uso; quedo con sesión 30 días |
| U2 | Quiero guardar favoritos | Un toque en el corazón guarda; persisten al volver; `/favoritos` los lista |
| U3 | Quiero compartir mi lista | El link abre `/lista` con las mismas propiedades y tiene imagen de vista previa |
| U4 | Quiero ver los resultados en un mapa | Vista mapa con pines de precio; al mover el mapa cambia la lista |
| U5 | Quiero ver mis consultas | `/cuenta` lista las consultas hechas con mi mail |
| P1 | Como dueño quiero publicar en pasos | 9 pasos, se guarda borrador en cada uno, puedo salir y retomar |
| P2 | Quiero ubicar mi propiedad en el mapa | Zona + dirección (Georef) + pin arrastrable; elijo punto exacto o zona aproximada |
| P3 | Quiero enviar a revisión y saber el resultado | Estado visible en "Mis propiedades"; mail al aprobar o rechazar, con motivo |
| P4 | Quiero editar, pausar y reactivar | Solo sobre mis propiedades |
| P5 | Quiero recibir y responder consultas | Bandeja en el panel + mail; botón para responder por WhatsApp o mail |
| A9 | Como admin quiero moderar | Cola de pendientes, vista previa, aprobar o rechazar con motivo |
| A10 | Quiero administrar usuarios | Buscar, ver sus propiedades, bloquear |
| A11 | Quiero publicar novedades | ABM de posts con borrador/publicado |

## Fase 3 — Calendario, temporadas, solicitud de reserva

| # | Historia | Criterio de aceptación |
|---|---|---|
| P6 | Quiero bloquear fechas | Selecciono un rango en el calendario y queda no disponible |
| P7 | Quiero precios por temporada | Cargo tarifas con rango de fechas; la ficha calcula el total para las fechas elegidas |
| V11 | Quiero buscar por fechas y ver solo lo disponible | La búsqueda excluye propiedades ocupadas en el rango |
| V12 | Quiero ver la disponibilidad en la ficha | Calendario con días ocupados tachados |
| U6 | Quiero solicitar una reserva | Elijo fechas y huéspedes, veo el total y envío; requiere cuenta |
| P8 | Quiero aceptar o rechazar solicitudes | Aceptar bloquea las fechas; no puedo aceptar dos que se pisan |
| U7 | Quiero saber qué pasó con mi solicitud | Estado en `/cuenta` y mail en cada cambio; vence sola a las 48 h sin respuesta |
| A12 | Como admin quiero ver todas las reservas | Lista con filtros por estado y propiedad |

## Fase 4 — Seña, reseñas, perfiles, notificaciones

| # | Historia | Criterio de aceptación |
|---|---|---|
| U8 | Quiero pagar la seña online | Al aceptarse la solicitud recibo un link de Mercado Pago; al aprobarse el pago la reserva queda confirmada |
| U9 | Si no pago a tiempo, la reserva se libera | Pasado el plazo queda vencida y las fechas vuelven a estar disponibles |
| U10 | Quiero dejar una reseña | Solo después de una estadía completada, una por reserva |
| V13 | Quiero ver reseñas y el perfil del anfitrión | Promedio y comentarios en la ficha; página del anfitrión con sus propiedades |
| P9 | Quiero responder reseñas | Una respuesta por reseña |
| N1 | Quiero recibir mails en cada evento importante | Ver tabla de mails en `06-business-rules.md` |

## Requisitos no funcionales

| Tema | Requisito |
|---|---|
| Mobile | Todo se diseña y prueba primero en celular (360–430 px) |
| Rendimiento | Home y listados cacheados; fotos con tamaños por dispositivo; sin saltos de layout |
| Calidad | El build falla si hay errores de tipos o de lint |
| Seguridad | Admin y panel protegidos por middleware; cada endpoint del panel verifica que el recurso sea del usuario; secretos solo en variables de entorno |
| Datos | Reglas de `base-de-datos.md` sin excepciones |
| Accesibilidad | Foco visible, etiquetas en botones de ícono, respeto de `prefers-reduced-motion` |
| Idioma | Español rioplatense en toda la interfaz |

## Fuera de alcance de la v1

WhatsApp Business API, mensajería interna, carga de propiedades con IA, sincronización iCal con Airbnb/Booking, tasaciones online, planes pagos, destacados pagos, comisiones, multi-idioma, app nativa.

## Orden de construcción de la Fase 1

1. Proyecto base: Next 16, Tailwind 4, Prisma, base local, scripts de base, tsconfig/eslint excluyendo la referencia.
2. Design system: tokens + componentes base (`components/ui`).
3. Schema Fase 1 + migración inicial + seed.
4. Admin: login, ABM de zonas y amenities, formulario de propiedad con fotos.
5. Sitio: header y navegación, home con buscador, listado con filtros, ficha.
6. Consultas: formulario, WhatsApp, mail, bandeja en admin.
7. SEO: metadata, JSON-LD, OG, sitemap, robots, llms.txt, páginas por zona.
8. Páginas institucionales, métricas básicas, revisión en celular y deploy.

Cada paso va en su rama y se prueba antes de pasar al siguiente.
