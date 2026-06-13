import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ orders: [] });

    const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } });
    if (!dbUser) return NextResponse.json({ orders: [] });

    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true, variant: true } },
        payment: true,
        shipment: true,
      },
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
