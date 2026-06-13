import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, nameEn, description, descriptionEn, status, isFeatured, tags, categoryId, variants } = body;

  const slug = slugify(name) + "-" + Date.now().toString(36);

  const product = await prisma.product.create({
    data: {
      name, nameEn, description, descriptionEn, status, isFeatured,
      tags: tags || [],
      slug,
      categoryId: categoryId || null,
      variants: {
        create: variants.map((v: any) => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          comparePrice: v.comparePrice || null,
          stock: v.stock,
          size: v.size || null,
          color: v.color || null,
          material: v.material || null,
          weight: v.weight || null,
          length: v.length || null,
          width: v.width || null,
          height: v.height || null,
          isActive: v.isActive,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
