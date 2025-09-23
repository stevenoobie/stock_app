-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
