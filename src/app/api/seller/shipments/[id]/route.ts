import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { trackingNumber, status } = await req.json();
  try {
    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(status && { status }),
      },
    });
    return NextResponse.json({ shipment });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
