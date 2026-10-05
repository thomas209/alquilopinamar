# 08 — API contracts

> Las páginas públicas leen de la base directo desde Server Components. La API existe para **escribir** y para lo que necesita el navegador (panel, admin, mapa, favoritos, webhooks).

## Convenciones

- Base: `/api`. JSON en pedido y respuesta.
- Éxito: `200` (o `201` al crear) con el recurso o `{ "ok": true }`.
- Error: `{ "error": "Mensaje en español para mostrar" }` con el código que corresponda.

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos |
| 401 | Sin sesión |
| 403 | Con sesión pero el recurso no es tuyo |
| 404 | No existe |
| 409 | Conflicto (fechas ocupadas, estado que no permite la acción) |
| 429 | Demasiados intentos |
| 500 | Error interno (se registra; al cliente va un mensaje genérico) |

- Fechas: `YYYY-MM-DD`. Montos: número con hasta 2 decimales + `currency` (`ARS` | `USD`).
- Listas: `{ "items": [...], "total": n, "page": n, "pageSize": n }`.
- Autenticación: `/api/admin/*` → sesión de admin (NextAuth). `/api/panel/*` → cookie de usuario. El middleware corta con 401 antes de llegar al endpoint.
- Todo endpoint que modifica algo visible al público llama a `refrescarSitio()`.
- Validación de entrada en el servidor en todos los endpoints.

## Objetos

**PropertyCard** (listados, mapa, favoritos)

```json
{
  "slug": "casa-en-carilo-ap-0123",
  "code": "AP-0123",
  "title": "Casa en el bosque a 300 m del mar",
  "operation": "ALQUILER_TEMPORARIO",
  "type": "CASA",
  "zone": { "slug": "carilo", "name": "Cariló" },
  "price": 250,
  "currency": "USD",
  "pricePeriod": "NOCHE",
  "priceOnRequest": false,
  "bedrooms": 3, "bathrooms": 2, "maxGuests": 6,
  "hasPool": true, "petsAllowed": false,
  "images": ["https://res.cloudinary.com/…"],
  "lat": -37.16, "lng": -56.9,
  "isFeatured": false,
  "available": true
}
```

`lat`/`lng` van redondeados si la publicación no muestra el punto exacto. `available` solo tiene sentido desde F3.

## Fase 1 — Públicos

### `GET /api/propiedades`
Para el cliente (ver más, mapa). Los mismos filtros que la URL del listado.

| Query | Valores |
|---|---|
| `operacion` | `alquiler-temporario` \| `alquiler-anual` \| `venta` |
| `zona` | slug |
| `tipo` | `casa` \| `departamento` \| `duplex` \| `cabana` \| `lote` \| `local` |
| `huespedes`, `ambientes`, `dormitorios`, `banos`, `cocheras` | número (mínimo) |
| `precioMin`, `precioMax`, `moneda` | número, `ARS` \| `USD` |
| `pileta`, `mascotas` | `1` |
| `marMax` | metros al mar (máximo) |
| `amenities` | slugs separados por coma (deben estar todas) |
| `desde`, `hasta` | fechas (F3: filtran disponibilidad) |
| `orden` | `destacadas` \| `nuevas` \| `precio_asc` \| `precio_desc` |
| `pagina` | número, 24 por página |
| `bbox` | `sur,oeste,norte,este` (F2, mapa) |

Respuesta: lista de `PropertyCard`.

### `GET /api/favoritos?slugs=a,b,c`
Devuelve `{ "items": [PropertyCard] }` de las publicadas (máximo 40). Las que ya no están publicadas vuelven con `"available": false` y sin precio.

### `POST /api/consultas`
```json
{
  "propertySlug": "casa-en-carilo-ap-0123",
  "name": "Ana Pérez",
  "email": "ana@mail.com",
  "phone": "11 5555 5555",
  "message": "Hola, quería consultar…",
  "checkIn": "2027-01-02",
  "checkOut": "2027-01-16",
  "guests": 5,
  "web": ""
}
```
- `web` es el campo trampa: si llega con contenido, responde `{ "ok": true }` sin guardar.
- `201 { "ok": true }`. Errores: `400` (datos), `404` (propiedad no publicada), `429` (límite por mail/IP).
- Efectos: guarda `Inquiry`, manda mail al admin (y al propietario desde F2).

### `POST /api/propiedades/[slug]/evento`
`{ "tipo": "vista" | "whatsapp" }` → `{ "ok": true }`. Suma al contador. Sin autenticación; ignora bots conocidos.

### `GET /api/georef/localidades?provincia=Buenos Aires`
`{ "localidades": ["Pinamar", "Cariló", …] }`. Si Georef falla devuelve lista vacía (el campo queda de texto libre).

### `GET /api/og/lista?p=…`
Imagen para compartir una lista de favoritos.

## Autenticación

### Admin
`/api/auth/[...nextauth]` — NextAuth con credenciales.

### Usuarios (Fase 2)

| Endpoint | Pedido | Respuesta |
|---|---|---|
| `POST /api/auth/usuario/request-link` | `{ "email", "volver"? }` | Siempre `{ "ok": true }` (no revela si el mail existe). `400` si el mail es inválido, `429` por exceso |
| `GET /api/auth/usuario/verify?token=…` | — | Valida, consume el token, setea la cookie y redirige a `volver` o `/cuenta`. Si falla: `/cuenta/ingresar?error=invalid` |
| `POST /api/auth/usuario/logout` | — | Borra la cookie. `{ "ok": true }` |
| `GET /api/auth/usuario/me` | — | `{ "user": { "id", "email", "firstName", "lastName", "isHost" } }` o `{ "user": null }` |
| `PATCH /api/panel/cuenta` | `{ "firstName", "lastName", "phone", "whatsapp", "bio"?, "avatarUrl"? }` | Usuario actualizado |

`volver` solo acepta rutas internas (empieza con `/` y no con `//`).

## Admin (`/api/admin/*`, sesión de admin)

### Propiedades

| Endpoint | Acción |
|---|---|
| `GET /api/admin/propiedades?q=&estado=&zona=&operacion=&pagina=` | Lista (busca por código o título) |
| `POST /api/admin/propiedades` | Crea |
| `GET /api/admin/propiedades/[id]` | Detalle completo |
| `PATCH /api/admin/propiedades/[id]` | Edita |
| `DELETE /api/admin/propiedades/[id]` | Baja lógica |
| `POST /api/admin/propiedades/[id]/estado` | `{ "status": "PUBLICADA" \| "PAUSADA" \| "BORRADOR" }` |
| `POST /api/admin/propiedades/[id]/duplicar` | Crea una copia en borrador (opcional `{ "operation" }`) |
| `POST /api/admin/propiedades/[id]/destacar` | `{ "isFeatured", "featuredUntil"?, "featuredOrder"? }` |
| `POST /api/admin/propiedades/[id]/moderar` (F2) | `{ "accion": "aprobar" }` o `{ "accion": "rechazar", "motivo": "…" }` |

Cuerpo de alta/edición:

```json
{
  "title": "…", "description": "…",
  "operation": "ALQUILER_TEMPORARIO", "type": "CASA",
  "zoneId": "…", "address": "…", "lat": -37.16, "lng": -56.9,
  "showExactLocation": false, "distanceToSeaM": 300,
  "rooms": 5, "bedrooms": 3, "bathrooms": 2, "garages": 1,
  "maxGuests": 6, "coveredM2": 140, "lotM2": 600,
  "hasPool": true, "petsAllowed": false,
  "price": 250, "currency": "USD", "pricePeriod": "NOCHE", "priceOnRequest": false,
  "houseRules": "…", "checkInTime": "15:00", "checkOutTime": "10:00", "minNights": 7,
  "contactWhatsapp": "…",
  "amenityIds": ["…"],
  "images": [{ "url": "…", "publicId": "…", "width": 2400, "height": 1600, "altText": "…" }],
  "rates": [{ "label": "Enero · 1ra quincena", "period": "QUINCENA", "amount": 4500, "currency": "USD", "startDate": "2027-01-01", "endDate": "2027-01-16" }]
}
```

El orden de `images` y `rates` en el arreglo es el orden guardado. Pasar a `PUBLICADA` valida los requisitos de publicación y responde `400` con la lista de lo que falta.

### Resto

| Endpoint | Acción |
|---|---|
| `POST /api/admin/upload` | Sube una foto a Cloudinary. Devuelve `{ "url", "publicId", "width", "height" }` |
| `GET/POST /api/admin/zonas`, `PATCH/DELETE /api/admin/zonas/[id]` | ABM de zonas (no se borra una zona con propiedades: `409`) |
| `GET/POST /api/admin/amenities`, `PATCH/DELETE /api/admin/amenities/[id]` | ABM de amenities |
| `GET /api/admin/consultas?estado=&propiedad=&pagina=` | Lista |
| `PATCH /api/admin/consultas/[id]` | `{ "status"?, "adminNotes"? }` |
| `GET/PUT /api/admin/contenido/[key]` | Lee o guarda un `SiteSetting` (hero de la home, datos de contacto) |
| `GET /api/admin/metricas` | `{ "propiedadesActivas", "consultasSemana", "pendientesModeracion", "masVistas": [...] }` |
| `GET /api/admin/usuarios`, `PATCH /api/admin/usuarios/[id]` (F2) | Lista y bloqueo |
| `GET/POST /api/admin/novedades`, `PATCH/DELETE /api/admin/novedades/[id]` (F2) | Blog |
| `GET /api/admin/reservas`, `PATCH /api/admin/reservas/[id]` (F3) | Lista y cancelación |

## Panel del propietario (`/api/panel/*`, cookie de usuario) — Fase 2

Todos verifican que el recurso sea del usuario; si no, `403`.

| Endpoint | Acción |
|---|---|
| `GET /api/panel/propiedades` | Mis propiedades |
| `POST /api/panel/propiedades` | Crea borrador (mínimo: operación y tipo) |
| `GET /api/panel/propiedades/[id]` | Detalle |
| `PATCH /api/panel/propiedades/[id]` | Guarda un paso (mismo cuerpo que admin, parcial). No acepta `status`, `isFeatured` ni `ownerId` |
| `DELETE /api/panel/propiedades/[id]` | Baja lógica |
| `POST /api/panel/propiedades/[id]/enviar` | Borrador/rechazada → en revisión. `400` con lo que falta |
| `POST /api/panel/propiedades/[id]/pausar` · `/reactivar` | Publicada ↔ pausada |
| `POST /api/panel/upload` | Igual que el de admin |
| `GET /api/panel/consultas?propiedad=&estado=` | Mis consultas |
| `PATCH /api/panel/consultas/[id]` | `{ "status" }` |

## Fase 3 — Disponibilidad y reservas

| Endpoint | Detalle |
|---|---|
| `GET /api/propiedades/[slug]/disponibilidad?desde=&hasta=` | `{ "ocupado": [{ "startDate", "endDate" }], "minNights": 7 }` |
| `GET /api/propiedades/[slug]/cotizacion?desde=&hasta=&huespedes=` | `{ "nights", "total", "currency", "detalle": [{ "label", "nights", "amount" }] }`. `409` si no está disponible |
| `POST /api/reservas` (usuario) | `{ "propertySlug", "checkIn", "checkOut", "guests", "message"? }` → `201` con la reserva `SOLICITADA`. El total lo calcula el servidor. `409` si no hay disponibilidad |
| `GET /api/reservas` (usuario) | Mis solicitudes |
| `POST /api/reservas/[id]/cancelar` (usuario) | Cancela |
| `GET /api/panel/reservas` | Solicitudes de mis propiedades |
| `POST /api/panel/reservas/[id]/aceptar` | Bloquea fechas en una transacción. `409` si se pisa con otra |
| `POST /api/panel/reservas/[id]/rechazar` | `{ "motivo"? }` |
| `GET /api/panel/propiedades/[id]/bloqueos` | Bloqueos y reservas |
| `POST /api/panel/propiedades/[id]/bloqueos` | `{ "startDate", "endDate", "note"? }`. `409` si se pisa |
| `DELETE /api/panel/propiedades/[id]/bloqueos/[bloqueoId]` | Solo bloqueos manuales |
| `GET /api/cron/vencer-reservas` | Cabecera `Authorization: Bearer CRON_SECRET`. Vence solicitudes sin respuesta y (F4) aceptadas sin seña; libera fechas. Devuelve conteos |

## Fase 4 — Pagos y reseñas

| Endpoint | Detalle |
|---|---|
| `POST /api/reservas/[id]/pago` (usuario) | Crea la preferencia de Mercado Pago por la seña. `{ "initPoint": "https://…" }`. `409` si la reserva no está aceptada o venció |
| `POST /api/webhooks/mercadopago` | Verifica la firma, consulta el pago a Mercado Pago y, si está aprobado, confirma la reserva. Idempotente por `mpPaymentId`. Responde `200` siempre que el aviso sea válido |
| `POST /api/resenas` (usuario) | `{ "bookingId", "rating", "comment" }`. `403` si la reserva no es tuya, `409` si no está completada o ya tiene reseña |
| `POST /api/panel/resenas/[id]/responder` | `{ "ownerReply" }` |
| `PATCH /api/admin/resenas/[id]` | `{ "status": "PUBLICADA" \| "OCULTA" }` |

## Resumen por fase

| Fase | Endpoints nuevos |
|---|---|
| 1 | Propiedades (lectura), favoritos, consultas, evento, georef, OG; auth admin; admin de propiedades, upload, zonas, amenities, consultas, contenido, métricas |
| 2 | Auth de usuario; panel (propiedades, upload, consultas, cuenta); moderación, usuarios y novedades en admin; `bbox` en el listado |
| 3 | Disponibilidad, cotización, reservas, bloqueos, cron |
| 4 | Pago, webhook, reseñas |
