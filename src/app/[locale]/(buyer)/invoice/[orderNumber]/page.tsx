import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoicePage } from "@/components/buyer/invoice-page";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function InvoiceRoute({ params }: Props) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true, variant: true } },
      payment: true,
      address: true,
      user: true,
    },
  });
  if (!order) notFound();
  return <InvoicePage order={order} />;
}
