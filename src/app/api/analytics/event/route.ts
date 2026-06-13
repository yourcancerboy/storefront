import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { type, userId, sessionId, productId, data } = await req.json();
  await prisma.analyticsEvent.create({ data: { type, userId, sessionId, productId, data } });
  return NextResponse.json({ ok: true });
}
