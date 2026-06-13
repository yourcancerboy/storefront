import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SellerOrderDetail } from "@/components/seller/order-detail";

interface Props { params: Promise<{ orderNumber: string }> }

export default async function SellerOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  let order = null;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        items: { include: { product: true, variant: true } },
        payment: true,
        shipment: { include: { trackingEvents: { orderBy: { timestamp: "desc" } } } },
      },
    });
  } catch {}
  if (!order) notFound();
  return <SellerOrderDetail order={order} />;
}
