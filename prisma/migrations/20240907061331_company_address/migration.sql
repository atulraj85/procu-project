/*
  Warnings:

  - The `address` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `lastDateToRespond` on the `RFP` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "address",
ADD COLUMN     "address" JSONB;

-- AlterTable
ALTER TABLE "RFP" DROP COLUMN "lastDateToRespond";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mobile" TEXT;

-- CreateIndex
CREATE INDEX "Product_name_modelNo_specification_idx" ON "Product"("name", "modelNo", "specification");

-- CreateIndex
CREATE INDEX "User_name_email_mobile_idx" ON "User"("name", "email", "mobile");

-- CreateIndex
CREATE INDEX "Vendor_primaryName_companyName_contactDisplayName_email_mob_idx" ON "Vendor"("primaryName", "companyName", "contactDisplayName", "email", "mobile", "gstin");
