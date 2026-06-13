import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ items: [] });

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      variant: true,
    },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, variantId, quantity } = await req.json();

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.stock < quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_variantId: { userId, variantId } },
    create: { userId, productId, variantId, quantity },
    update: { quantity: { increment: quantity } },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await req.json();
  await prisma.cartItem.deleteMany({ where: { id: itemId, userId } });
  return NextResponse.json({ success: true });
}
