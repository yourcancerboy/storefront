import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { orderId, approved, notes } = await req.json();

  const payment = await prisma.payment.update({
    where: { orderId },
    data: {
      status: approved ? "PAID" : "FAILED",
      paidAt: approved ? new Date() : null,
      verifiedAt: new Date(),
      notes,
    },
  });

  if (approved) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_VERIFIED", paymentStatus: "PAID", paidAt: new Date() },
    });
  }

  return NextResponse.json({ payment });
}
