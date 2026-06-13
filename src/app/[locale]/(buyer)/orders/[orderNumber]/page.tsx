import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderDetail } from "@/components/buyer/order-detail";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true, variant: true } },
      payment: true,
      shipment: { include: { trackingEvents: { orderBy: { timestamp: "desc" } } } },
      address: true,
      user: true,
    },
  });
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
