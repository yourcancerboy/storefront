import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createBankTransferInvoice } from "@/lib/payment";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const userId = dbUser.id;

    const body = await req.json();
    const { address, shippingCost = 0, courierCode, courierService, couponCode, discountAmount = 0, notes } = body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true },
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
    const total = subtotal + shippingCost - discountAmount;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Save address
      const savedAddress = await tx.address.create({
        data: {
          userId,
          recipientName: address.recipientName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          district: address.district,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: savedAddress.id,
          subtotal,
          shippingCost,
          discountAmount,
          total,
          notes,
          couponCode,
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
            })),
          },
        },
      });

      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (courierCode) {
        await tx.shipment.create({
          data: {
            orderId: newOrder.id,
            courierCode,
            courierService: courierService || "",
            shippingCost,
            recipientName: address.recipientName,
            recipientPhone: address.phone,
            recipientAddress: `${address.addressLine1}, ${address.district}, ${address.city}, ${address.province} ${address.postalCode}`,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    await createBankTransferInvoice(order.id, order.orderNumber, total);

    // Send order confirmation email (non-blocking)
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        total,
        customerName: dbUser.name || "",
        customerEmail: dbUser.email,
        items: cartItems.map((i) => ({
          productName: i.product.name,
          variantName: i.variant.name,
          quantity: i.quantity,
          subtotal: i.variant.price * i.quantity,
        })),
      });
    } catch {}

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (e: any) {
    console.error("Order error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
