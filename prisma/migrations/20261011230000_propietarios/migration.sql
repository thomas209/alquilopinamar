-- Fase 2d: propiedades de los propietarios.
-- Solo agrega tres columnas a Property (todas opcionales o con valor por defecto).
-- Las propiedades que ya existen quedan sin dueño: son las que carga el admin.

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "needsReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Property_ownerId_status_idx" ON "Property"("ownerId", "status");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
