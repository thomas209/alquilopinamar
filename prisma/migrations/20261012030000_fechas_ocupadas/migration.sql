-- Fechas ocupadas: lo alquilado se marca por fechas y no por periodo entero,
-- asi pueden quedar noches sueltas libres dentro de una quincena.
-- Agrega una tabla y copia ahi los periodos que estaban marcados como alquilados.
-- No borra ni cambia nada de lo que ya existe.

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityBlock_propertyId_startDate_idx" ON "AvailabilityBlock"("propertyId", "startDate");

-- AddForeignKey
ALTER TABLE "AvailabilityBlock" ADD CONSTRAINT "AvailabilityBlock_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Datos: cada periodo marcado como alquilado pasa a ser un rango de fechas ocupadas
INSERT INTO "AvailabilityBlock" ("id", "propertyId", "startDate", "endDate")
SELECT 'mig_' || "id", "propertyId", "startDate", "endDate"
FROM "PropertyRate"
WHERE "isAvailable" = false AND "startDate" IS NOT NULL AND "endDate" IS NOT NULL AND "endDate" > "startDate";
