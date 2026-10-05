# 01 — Visión de producto

> Estado: borrador v1 para aprobación. Fuente: `PROMPT.md` + `CLAUDE.md`.
> Si este doc contradice a `PROMPT.md`, gana `PROMPT.md`.

## Qué es AlquiloPinamar

Un marketplace inmobiliario propio para Pinamar y alrededores: **alquiler temporario, alquiler anual y venta**. Junta dos cosas que hoy están separadas:

- El **catálogo de una inmobiliaria clásica** (referencia funcional: pinamar-bariloche.com.ar): código de propiedad, ficha completa, tarifas por quincena, consulta directa.
- La **experiencia de Airbnb**: búsqueda por fechas, calendario, mapa, perfil del anfitrión, reseñas, y que el dueño publique solo.

Zonas de arranque: Pinamar, Cariló, Valeria del Mar, Ostende, Costa Esmeralda.

## Problema que resuelve

| Para quién | Hoy | Con AlquiloPinamar |
|---|---|---|
| El que busca | Webs de inmobiliarias viejas, lentas en el celular, sin fechas ni mapa; o Airbnb sin oferta local de venta/anual | Un solo lugar, rápido, con filtros reales de la zona (distancia al mar, pileta, mascotas, quincena) |
| El dueño | Depende de la inmobiliaria o de grupos de Facebook/WhatsApp | Publica gratis en pasos, maneja precios y calendario, recibe consultas directo |
| Nosotros | — | Canal propio de tráfico y leads en la zona, con base para monetizar después |

## Prioridades (en este orden)

1. Lanzar una versión funcional lo antes posible.
2. Arquitectura escalable.
3. Experiencia premium, mobile first.
4. Evitar complejidad innecesaria.

Cuando dos prioridades chocan, gana la de número más bajo.

## Roles

| Rol | Qué hace | Desde qué fase |
|---|---|---|
| Visitante | Busca, filtra, ve fichas, consulta por WhatsApp o formulario | 1 |
| Admin | Carga y modera propiedades, zonas, amenities, consultas, destacados, contenido | 1 |
| Usuario registrado | Favoritos, consultas con historial, solicitudes de reserva, reseñas | 2 (reservas 3, reseñas 4) |
| Propietario / anfitrión | Publica y edita sus propiedades, fotos, precios, calendario; recibe consultas | 2 (calendario 3) |

Usuario y propietario son la **misma cuenta**: un usuario pasa a ser anfitrión cuando publica su primera propiedad.

## Modelo de negocio

- **Ahora: gratis.** Publicar y consultar no cuesta nada. El objetivo es oferta y tráfico.
- **Después (no se construye ahora):** propiedades destacadas pagas, planes para propietarios, comisión por reserva.
- Lo único que se hace hoy es dejar el schema preparado: campos de destacado con vencimiento, plan del propietario y comisión en la reserva (ver `03-schema-prisma-v1.md`). Sin pantallas, sin lógica de cobro.

## Fases

| Fase | Incluye | Se considera lista cuando |
|---|---|---|
| **1 — MVP** | Catálogo público, buscador y filtros, ficha, consulta por WhatsApp y formulario, admin que carga propiedades, SEO base | Un visitante encuentra una propiedad desde Google o la home y consulta; el admin carga y publica sin tocar código |
| **2** | Registro con link mágico, publicación por propietarios con moderación, favoritos, mapa | Un dueño publica solo y el admin aprueba; el listado tiene vista mapa |
| **3** | Calendario de disponibilidad, precios por temporada, solicitud de reserva | La búsqueda por fechas excluye lo ocupado; el dueño acepta o rechaza solicitudes |
| **4** | Seña con Mercado Pago, reseñas, perfiles de anfitrión, mails de notificación | Una reserva aceptada se confirma pagando la seña; después de la estadía se puede reseñar |
| **Futuro** | WhatsApp Business, mensajería interna, carga con IA, iCal con Airbnb/Booking, tasaciones, monetización | — |

## Qué NO es la v1

- No es un sistema de gestión inmobiliaria (contratos, cobranzas, liquidaciones a dueños).
- No hay pagos hasta la Fase 4, y ahí solo la seña.
- No hay app nativa: es web mobile first con sensación de app.
- No hay chat interno: el contacto es WhatsApp, formulario y mail.
- No hay multi-idioma ni conversión de monedas.

## Indicadores

| Indicador | De dónde sale |
|---|---|
| Propiedades publicadas (por zona y operación) | Base |
| Consultas por formulario y clics a WhatsApp | Base (`Inquiry`, contador en `Property`) |
| Visitas y fichas más vistas | Vercel Analytics + contador de vistas |
| Tasa de consulta (consultas / vistas de ficha) | Calculado en el admin |
| Propietarios activos y publicaciones en revisión | Base (Fase 2) |
| Solicitudes de reserva y % aceptadas | Base (Fase 3) |

## Riesgos y cómo se cubren

| Riesgo | Mitigación |
|---|---|
| Arrancar sin oferta | En Fase 1 el admin carga el catálogo inicial; los dueños llegan en Fase 2 |
| Publicaciones truchas o de baja calidad | Moderación obligatoria antes de publicar; mínimo de fotos |
| Perder la base de producción (ya pasó en Member) | Reglas de `base-de-datos.md` desde el día uno |
| Estacionalidad fuerte (verano) | Llegar a diciembre con Fase 1 y 2 sólidas; reservas y pagos pueden esperar |
| Sobreingeniería | Cada fase se entrega sola y funcionando; nada de construir lo de la fase siguiente "por las dudas" |

## Decisiones abiertas (necesitan tu OK)

1. **Una publicación = una operación.** Una casa en venta y en alquiler temporario son dos publicaciones (con botón "duplicar" en el admin). Simplifica filtros, precios, estados y SEO.
2. **Monedas:** USD y ARS por publicación, sin conversión. El filtro de precio trabaja sobre una moneda a la vez.
3. **Favoritos en el navegador** (como Member), sin tabla en la base. La lista compartible viaja en el link.
4. **Datos de marca que faltan:** dominio definitivo, número de WhatsApp del sitio, logo.
5. **Seña (Fase 4):** porcentaje y plazo para pagarla. Propuesta: 30 % y 24 h.
