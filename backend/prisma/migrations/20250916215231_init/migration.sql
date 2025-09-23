/*
  Warnings:

  - You are about to drop the column `total` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `totalAfterDiscount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBeforeDiscount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "total",
ADD COLUMN     "globalDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAfterDiscount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalBeforeDiscount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "clientName" DROP NOT NULL,
ALTER COLUMN "clientPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SaleItem" DROP COLUMN "salePrice",
ADD COLUMN     "material" TEXT NOT NULL,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
