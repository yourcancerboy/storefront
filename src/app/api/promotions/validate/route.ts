import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();

  const promo = await prisma.promotion.findUnique({
    where: { code },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: "Kode kupon tidak ditemukan." }, { status: 400 });
  }

  const now = new Date();
  if (promo.startsAt > now || promo.endsAt < now) {
    return NextResponse.json({ error: "Kode kupon sudah kedaluwarsa." }, { status: 400 });
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return NextResponse.json({ error: "Kode kupon sudah mencapai batas penggunaan." }, { status: 400 });
  }

  if (promo.minimumOrder && orderTotal < promo.minimumOrder) {
    return NextResponse.json({
      error: `Minimum belanja ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(promo.minimumOrder)} untuk menggunakan kupon ini.`
    }, { status: 400 });
  }

  let discount = 0;
  if (promo.type === "PERCENTAGE") {
    discount = Math.floor((orderTotal * promo.discountValue) / 100);
    if (promo.maximumDiscount) discount = Math.min(discount, promo.maximumDiscount);
  } else if (promo.type === "FIXED_AMOUNT") {
    discount = Math.min(promo.discountValue, orderTotal);
  } else if (promo.type === "FREE_SHIPPING") {
    discount = 0; // handled separately in checkout
  }

  return NextResponse.json({ discount, promo: { name: promo.name, type: promo.type } });
}
