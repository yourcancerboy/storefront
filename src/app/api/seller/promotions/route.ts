import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return NextResponse.json({ promotions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, description, code, type, scope, discountValue,
    minimumOrder, maximumDiscount, usageLimit, perUserLimit,
    startsAt, endsAt, productIds
  } = body;

  const promotion = await prisma.promotion.create({
    data: {
      name, description, type, scope, discountValue,
      code: code || null,
      minimumOrder: minimumOrder || null,
      maximumDiscount: maximumDiscount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      isActive: true,
      ...(productIds?.length > 0 && {
        products: {
          create: productIds.map((id: string) => ({ productId: id })),
        },
      }),
    },
  });

  return NextResponse.json({ promotion }, { status: 201 });
}
