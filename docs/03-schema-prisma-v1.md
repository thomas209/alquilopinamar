# 03 — Schema Prisma v1

> Diseño completo de las cuatro fases, pero **cada fase crea su propia migración**. La migración inicial solo incluye lo marcado como Fase 1. Nada de `db push`: ver `base-de-datos.md`.

## Resumen

| Modelo | Fase | Para qué |
|---|---|---|
| `AdminUser` | 1 | Login del backoffice |
| `Zone` | 1 | Pinamar, Cariló, Valeria del Mar, Ostende, Costa Esmeralda. Base de las páginas SEO por zona |
| `Property` | 1 | La publicación |
| `PropertyImage` | 1 | Fotos (la primera es la portada) |
| `Amenity` / `PropertyAmenity` | 1 | Catálogo de amenities y su relación |
| `PropertyRate` | 1 | Tabla de tarifas (enero 1ra quincena, etc.). En F3 se usa para calcular precio por fechas |
| `Inquiry` | 1 | Consultas del formulario |
| `SiteSetting` | 1 | Contenido editable de la home y datos del sitio |
| `User` | 2 | Usuario registrado y propietario (misma cuenta) |
| `Post` | 2 | Blog / novedades |
| `AvailabilityBlock` | 3 | Fechas bloqueadas u ocupadas |
| `Booking` | 3 | Solicitud de reserva (y seña en F4) |
| `Review` | 4 | Reseñas de estadías terminadas |

Favoritos no tienen tabla: viven en el navegador (Zustand + localStorage), como en Member.

## Relaciones

```
Zone 1───N Property N───N Amenity   (PropertyAmenity)
               │
               ├──N PropertyImage
               ├──N PropertyRate
               ├──N Inquiry ──────────N─1 User (opcional)
               ├──N AvailabilityBlock ─1─1 Booking (opcional)
               ├──N Booking ──────────N─1 User
               └──N Review ───────────1─1 Booking
User 1───N Property   (ownerId; null = cargada por el admin)
```

## Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────────────────── FASE 1 ─────────────────────────

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole @default(EDITOR)
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Zone {
  id             String   @id @default(cuid())
  slug           String   @unique
  name           String
  description    String?  @db.Text   // texto de la página de zona
  coverImage     String?
  lat            Float?
  lng            Float?
  seoTitle       String?
  seoDescription String?
  sortOrder      Int      @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  properties Property[]
}

model Property {
  id   String @id @default(cuid())
  code Int    @unique @default(autoincrement()) // se muestra como AP-0001
  slug String @unique

  title       String
  description String         @db.Text
  operation   Operation
  type        PropertyType
  status      PropertyStatus @default(BORRADOR)
  rejectionReason String?
  publishedAt DateTime?

  // Ubicación
  zoneId            String
  zone              Zone    @relation(fields: [zoneId], references: [id])
  address           String? // privada: no se muestra en la ficha
  lat               Float?
  lng               Float?
  showExactLocation Boolean @default(false) // false = zona aproximada en el mapa
  distanceToSeaM    Int?    // metros al mar

  // Características
  rooms       Int?  // ambientes
  bedrooms    Int?
  bathrooms   Int?
  garages     Int?
  maxGuests   Int?
  coveredM2   Int?
  lotM2       Int?
  hasPool     Boolean @default(false)
  petsAllowed Boolean @default(false)

  // Precio base (el "desde" del listado y lo que se ordena)
  price          Decimal?    @db.Decimal(14, 2)
  currency       Currency    @default(USD)
  pricePeriod    PricePeriod
  priceOnRequest Boolean     @default(false) // muestra "Consultar"
  expenses       Decimal?    @db.Decimal(14, 2) // expensas (alquiler anual)

  // Estadía
  houseRules   String? @db.Text
  checkInTime  String?
  checkOutTime String?
  minNights    Int?

  // Contacto: si es null se usa el WhatsApp del sitio
  contactWhatsapp String?

  // Destacados (preparado para monetizar; hoy lo maneja el admin)
  isFeatured    Boolean   @default(false)
  featuredUntil DateTime?
  featuredOrder Int?

  // Métricas simples
  viewCount      Int @default(0)
  whatsappClicks Int @default(0)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // baja lógica

  images    PropertyImage[]
  amenities PropertyAmenity[]
  rates     PropertyRate[]
  inquiries Inquiry[]

  // FASE 2
  ownerId String?
  owner   User?   @relation(fields: [ownerId], references: [id])

  // FASE 3 / 4
  blocks   AvailabilityBlock[]
  bookings Booking[]
  reviews  Review[]

  @@index([status, operation, zoneId, type])
  @@index([status, operation, currency, price])
  @@index([status, isFeatured, featuredOrder])
  @@index([ownerId])
}

model PropertyImage {
  id         String   @id @default(cuid())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  url        String
  publicId   String   // id en Cloudinary, para borrar y transformar
  width      Int?
  height     Int?
  altText    String?
  sortOrder  Int      @default(0) // 0 = portada
  createdAt  DateTime @default(now())

  @@index([propertyId, sortOrder])
}

model Amenity {
  id        String  @id @default(cuid())
  slug      String  @unique
  name      String
  icon      String? // nombre del ícono del set único
  sortOrder Int     @default(0)
  isActive  Boolean @default(true)

  properties PropertyAmenity[]
}

model PropertyAmenity {
  propertyId String
  amenityId  String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  amenity    Amenity  @relation(fields: [amenityId], references: [id], onDelete: Cascade)

  @@id([propertyId, amenityId])
  @@index([amenityId])
}

model PropertyRate {
  id         String      @id @default(cuid())
  propertyId String
  property   Property    @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  label      String      // "Enero · 1ra quincena", "Temporada baja"
  period     PricePeriod
  amount     Decimal     @db.Decimal(14, 2)
  currency   Currency
  startDate  DateTime?   @db.Date // F1: opcional (solo informativo). F3: se usa para calcular
  endDate    DateTime?   @db.Date // exclusivo
  minNights  Int?
  sortOrder  Int         @default(0)

  @@index([propertyId, startDate, endDate])
}

model Inquiry {
  id         String        @id @default(cuid())
  propertyId String
  property   Property      @relation(fields: [propertyId], references: [id])
  name       String
  email      String
  phone      String?
  message    String        @db.Text
  checkIn    DateTime?     @db.Date
  checkOut   DateTime?     @db.Date
  guests     Int?
  status     InquiryStatus @default(NUEVA)
  adminNotes String?       @db.Text
  ipHash     String?       // hash de la IP, solo para el límite anti-spam
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  // FASE 2
  userId String?
  user   User?   @relation(fields: [userId], references: [id])

  @@index([propertyId, createdAt])
  @@index([status, createdAt])
  @@index([email])
}

model SiteSetting {
  key       String   @id   // "home.hero", "sitio.contacto", ...
  value     Json
  updatedAt DateTime @updatedAt
}

// ───────────────────────── FASE 2 ─────────────────────────
// Implementado en la migracion 20261010150000_usuarios con dos cambios:
//  - User: un solo campo "phone" (telefono / WhatsApp) y sin token de ingreso.
//  - Tabla LoginLink: links de ingreso (hash del token, 15 min, un solo uso,
//    limite anti-abuso por mail e IP). La cuenta se crea recien al usar el link.
// El schema real es prisma/schema.prisma.

model User {
  id        String  @id @default(cuid())
  email     String  @unique
  firstName String  @default("")
  lastName  String  @default("")
  phone     String?
  whatsapp  String?
  avatarUrl String?
  bio       String? @db.Text // perfil de anfitrión (F4)
  isHost    Boolean @default(false) // pasa a true al crear su primera propiedad
  isBlocked Boolean @default(false)

  // Preparado para monetizar: hoy todos GRATIS
  plan      OwnerPlan @default(GRATIS)
  planUntil DateTime?

  // Link mágico: se guarda el hash del token, nunca el token
  loginTokenHash      String?   @unique
  loginTokenExpiresAt DateTime?
  lastLoginAt         DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  properties Property[]
  inquiries  Inquiry[]
  bookings   Booking[]
  reviews    Review[]
}

model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String?
  content     String    @db.Text
  coverImage  String?
  publishedAt DateTime? // null = borrador
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([publishedAt])
}

// ───────────────────────── FASE 3 ─────────────────────────

model AvailabilityBlock {
  id         String    @id @default(cuid())
  propertyId String
  property   Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  startDate  DateTime  @db.Date
  endDate    DateTime  @db.Date // exclusivo (día de salida)
  kind       BlockKind
  note       String?
  bookingId  String?   @unique
  booking    Booking?  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())

  @@index([propertyId, startDate, endDate])
}

model Booking {
  id         String   @id @default(cuid())
  number     Int      @unique @default(autoincrement())
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])

  checkIn  DateTime @db.Date
  checkOut DateTime @db.Date // exclusivo
  nights   Int
  guests   Int
  message  String?  @db.Text

  status      BookingStatus @default(SOLICITADA)
  totalAmount Decimal       @db.Decimal(14, 2) // se congela al solicitar
  currency    Currency

  expiresAt    DateTime? // plazo para responder (F3) o para pagar la seña (F4)
  respondedAt  DateTime?
  cancelledAt  DateTime?
  cancelReason String?

  // FASE 4
  depositAmount    Decimal?  @db.Decimal(14, 2)
  paidAt           DateTime?
  mpPreferenceId   String?
  mpPaymentId      String?   @unique
  commissionAmount Decimal?  @db.Decimal(14, 2) // preparado para monetizar; hoy null

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  block  AvailabilityBlock?
  review Review?

  @@index([propertyId, status])
  @@index([userId, createdAt])
  @@index([status, expiresAt])
}

// ───────────────────────── FASE 4 ─────────────────────────

model Review {
  id         String       @id @default(cuid())
  bookingId  String       @unique
  booking    Booking      @relation(fields: [bookingId], references: [id])
  propertyId String
  property   Property     @relation(fields: [propertyId], references: [id])
  userId     String
  user       User         @relation(fields: [userId], references: [id])
  rating     Int          // 1 a 5
  comment    String       @db.Text
  ownerReply String?      @db.Text
  status     ReviewStatus @default(PUBLICADA)
  createdAt  DateTime     @default(now())

  @@index([propertyId, status, createdAt])
}

// ───────────────────────── ENUMS ─────────────────────────

enum AdminRole {
  SUPERADMIN
  EDITOR
}
enum Operation {
  ALQUILER_TEMPORARIO
  ALQUILER_ANUAL
  VENTA
}
enum PropertyType {
  CASA
  DEPARTAMENTO
  DUPLEX
  CABANA
  LOTE
  LOCAL
}
enum PropertyStatus {
  BORRADOR
  EN_REVISION
  PUBLICADA
  PAUSADA
  RECHAZADA
}
enum Currency {
  ARS
  USD
}
enum PricePeriod {
  NOCHE
  SEMANA
  QUINCENA
  MES
  TEMPORADA
  TOTAL
}
enum InquiryStatus {
  NUEVA
  RESPONDIDA
  CERRADA
}
enum OwnerPlan {
  GRATIS
}
enum BlockKind {
  BLOQUEO_MANUAL
  RESERVA
}
enum BookingStatus {
  SOLICITADA
  ACEPTADA
  RECHAZADA
  CONFIRMADA
  CANCELADA
  VENCIDA
  COMPLETADA
}
enum ReviewStatus {
  PUBLICADA
  OCULTA
}
```

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| Una publicación tiene **una sola operación** | Filtros, orden por precio, estados y URLs quedan simples. Venta + alquiler = dos publicaciones |
| `price` + `currency` + `pricePeriod` en `Property`, y `PropertyRate` aparte | El listado necesita un precio base para ordenar y filtrar; la ficha muestra la tabla de tarifas completa |
| `hasPool` y `petsAllowed` como columnas, el resto como `Amenity` | Son filtros principales: columna = consulta e índice simples |
| `code` autoincremental | Código corto estilo inmobiliaria (`AP-0001`) para buscar y mencionar por WhatsApp |
| `address` privada + `showExactLocation` | Por defecto se muestra zona aproximada; la dirección exacta no va en la ficha pública |
| Fechas con `@db.Date` y `endDate`/`checkOut` exclusivos | Evita problemas de zona horaria y permite que un huésped salga el mismo día que entra otro |
| Baja lógica (`deletedAt`) en `Property` | Nunca se pierden consultas ni reservas asociadas |
| `User` único para usuario y propietario | Menos modelos y un solo login; `isHost` distingue |
| Token de login hasheado | Si se filtra la base, los links pendientes no sirven |
| Sin tabla de favoritos | Igual que Member: cero backend, lista compartible por link. Se puede sumar tabla más adelante |
| Monetización solo como campos | `isFeatured`/`featuredUntil`, `User.plan`/`planUntil`, `Booking.commissionAmount`. Sin lógica |

## Reglas de integridad que van en código (no en el schema)

- **Solapamiento de fechas:** crear un `AvailabilityBlock` se hace dentro de una transacción que primero verifica que no exista otro bloque de la misma propiedad que se cruce. Si en F3 hay carreras reales, se agrega una restricción de exclusión en Postgres con migración escrita a mano.
- **Publicar** exige: título, descripción, zona, tipo, operación, precio (o "Consultar") y mínimo de fotos (ver `06-business-rules.md`).
- **Slug:** se genera del título + código y no cambia después de publicar.

## Migraciones previstas

| Migración | Contenido |
|---|---|
| `init` | Todo lo de Fase 1 |
| `add_users_and_owner` | `User`, `Post`, `Property.ownerId`, `Inquiry.userId` |
| `add_availability_and_bookings` | `AvailabilityBlock`, `Booking` (sin campos de pago) |
| `add_payments_and_reviews` | Campos de seña en `Booking`, `Review` |

## Seed

`prisma/seed.ts` (solo local): las 5 zonas, amenities base (wifi, parrilla, aire acondicionado, calefacción, pileta climatizada, cochera cubierta, ropa blanca, lavarropas, seguridad, quincho, jardín, vista al mar) y algunas propiedades de ejemplo. `prisma/create-admin.ts` crea el primer admin.
