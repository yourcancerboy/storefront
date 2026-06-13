import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createBankTransferInvoice } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addressId, shippingCost, courierCode, courierService, couponCode, notes, promotionId } = await req.json();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
      variant: true,
    },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of cartItems) {
    if (item.variant.stock < item.quantity) {
      return NextResponse.json({ error: `Stok ${item.product.name} tidak cukup` }, { status: 400 });
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  let discountAmount = 0;
  if (promotionId) {
    const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
    if (promo && promo.isActive) {
      if (promo.type === "PERCENTAGE") {
        discountAmount = Math.floor((subtotal * promo.discountValue) / 100);
        if (promo.maximumDiscount) discountAmount = Math.min(discountAmount, promo.maximumDiscount);
      } else if (promo.type === "FIXED_AMOUNT") {
        discountAmount = promo.discountValue;
      } else if (promo.type === "FREE_SHIPPING") {
        discountAmount = shippingCost;
      }
    }
  }

  const total = subtotal + shippingCost - discountAmount;
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        subtotal,
        shippingCost,
        discountAmount,
        total,
        notes,
        couponCode,
        promotionId,
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.product.name,
            variantName: i.variant.name,
            sku: i.variant.sku,
            price: i.variant.price,
            quantity: i.quantity,
            subtotal: i.variant.price * i.quantity,
            imageUrl: undefined,
          })),
        },
      },
    });

    // Decrement stock
    for (const item of cartItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create shipment record
    const address = await tx.address.findUnique({ where: { id: addressId } });
    if (address && courierCode) {
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          courierCode,
          courierService,
          shippingCost,
          recipientName: address.recipientName,
          recipientPhone: address.phone,
          recipientAddress: `${address.addressLine1}, ${address.district}, ${address.city}, ${address.province} ${address.postalCode}`,
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  await createBankTransferInvoice(order.id, order.orderNumber, total);

  return NextResponse.json({ orderNumber: order.orderNumber });
}
