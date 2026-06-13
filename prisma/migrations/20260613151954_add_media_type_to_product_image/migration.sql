-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "type" "MediaType" NOT NULL DEFAULT 'IMAGE';
