import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, nameEn, description, descriptionEn, status, isFeatured, tags, categoryId, variants } = body;

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        name, nameEn, description, descriptionEn, status, isFeatured,
        tags: tags || [],
        categoryId: categoryId || null,
      },
    });

    for (const v of variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            name: v.name, price: v.price, comparePrice: v.comparePrice || null,
            stock: v.stock, size: v.size || null, color: v.color || null,
            material: v.material || null, weight: v.weight || null,
            length: v.length || null, width: v.width || null, height: v.height || null,
            isActive: v.isActive,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id, sku: v.sku, name: v.name, price: v.price,
            comparePrice: v.comparePrice || null, stock: v.stock,
            size: v.size || null, color: v.color || null, material: v.material || null,
            weight: v.weight || null, length: v.length || null,
            width: v.width || null, height: v.height || null, isActive: v.isActive,
          },
        });
      }
    }

    return updated;
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ success: true });
}
