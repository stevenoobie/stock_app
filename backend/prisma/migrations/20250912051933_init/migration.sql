-- DropForeignKey
ALTER TABLE "public"."Stock" DROP CONSTRAINT "Stock_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
