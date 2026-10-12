-- Disponibilidad por periodo (temporada).
-- Solo agrega columnas con valor por defecto u opcionales: las tarifas existentes
-- quedan como disponibles y sin valor diario.

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availabilityUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PropertyRate" ADD COLUMN     "dailyAmount" DECIMAL(14,2),
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
