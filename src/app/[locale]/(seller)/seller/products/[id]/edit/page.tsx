import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/seller/product-form";
interface Props { params: Promise<{ id: string }> }
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true, images: true } });
  if (!product) notFound();
  return <div className="max-w-4xl"><h1 className="text-2xl font-bold mb-6">Edit Produk</h1><ProductForm product={product} /></div>;
}
