-- Costos extra del alquiler temporario: limpieza final y deposito en garantia.
-- Solo agrega dos columnas opcionales. No borra ni cambia nada.

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "cleaningFee" DECIMAL(14,2),
ADD COLUMN     "securityDeposit" DECIMAL(14,2);
