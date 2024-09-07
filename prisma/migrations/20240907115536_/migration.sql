/*
  Warnings:

  - You are about to drop the column `billAmount` on the `Quotation` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `Quotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApproversList" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "billAmount",
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "RFPProduct" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "VendorPricing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL,
    "rfpProductId" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorPricing_quotationId_rfpProductId_key" ON "VendorPricing"("quotationId", "rfpProductId");

-- AddForeignKey
ALTER TABLE "VendorPricing" ADD CONSTRAINT "VendorPricing_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPricing" ADD CONSTRAINT "VendorPricing_rfpProductId_fkey" FOREIGN KEY ("rfpProductId") REFERENCES "RFPProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
