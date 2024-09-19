/*
  Warnings:

  - The values [PENDING,IN_PROGRESS,INVOICE_NOT_RECEIVED,GRN_NOT_RECEIVED,PAYMENT_NOT_DONE,COMPLETED] on the enum `RFPStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `Company` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProductCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProductCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `productCategoryId` on the `Vendor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[GST]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gstin]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `remarks` to the `PO` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `productCategoryId` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `totalAmountWithoutGST` to the `Quotation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `productId` on the `RFPProduct` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `GST` to the `VendorPricing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BUSINESS', 'SHIPPING');

-- AlterEnum
BEGIN;
CREATE TYPE "RFPStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'PO_CREATED', 'ADVANCE_PAID', 'INVOICE_RECEIVED', 'GRN_RECEIVED', 'PAYMENT_DONE');
ALTER TABLE "RFP" ALTER COLUMN "rfpStatus" DROP DEFAULT;
ALTER TABLE "RFP" ALTER COLUMN "rfpStatus" TYPE "RFPStatus_new" USING ("rfpStatus"::text::"RFPStatus_new");
ALTER TYPE "RFPStatus" RENAME TO "RFPStatus_old";
ALTER TYPE "RFPStatus_new" RENAME TO "RFPStatus";
DROP TYPE "RFPStatus_old";
ALTER TABLE "RFP" ALTER COLUMN "rfpStatus" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "RFPProduct" DROP CONSTRAINT "RFPProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_productCategoryId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "address",
ADD COLUMN     "GST" TEXT,
ADD COLUMN     "gstAddress" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "stamp" TEXT;

-- AlterTable
ALTER TABLE "PO" ADD COLUMN     "remarks" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "productCategoryId",
ADD COLUMN     "productCategoryId" UUID NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "refNo" TEXT,
ADD COLUMN     "totalAmountWithoutGST" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "RFPProduct" ADD COLUMN     "description" TEXT,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "productCategoryId";

-- AlterTable
ALTER TABLE "VendorPricing" ADD COLUMN     "GST" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "addressType" "AddressType" NOT NULL,
    "companyId" UUID NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherCharge" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quotationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "gst" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtherCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtherCharge_quotationId_name_key" ON "OtherCharge"("quotationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_GST_key" ON "Company"("GST");

-- CreateIndex
CREATE UNIQUE INDEX "RFPProduct_rfpId_productId_key" ON "RFPProduct"("rfpId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_gstin_key" ON "Vendor"("gstin");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherCharge" ADD CONSTRAINT "OtherCharge_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFPProduct" ADD CONSTRAINT "RFPProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
