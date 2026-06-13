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

    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });
      if (fullOrder) {
        const { sendPaymentVerifiedEmail } = await import("@/lib/email");
        await sendPaymentVerifiedEmail({
          orderNumber: fullOrder.orderNumber,
          customerName: fullOrder.user.name || "",
          customerEmail: fullOrder.user.email,
        });
      }
    } catch {}
  }

  return NextResponse.json({ payment });
}
