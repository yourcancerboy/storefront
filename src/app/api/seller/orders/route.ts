import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where = status && status !== "all" ? { status: status as any } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        payment: true,
        shipment: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const { orderId, status, paymentStatus } = await req.json();
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
  });
  return NextResponse.json({ order });
}
