import { NextRequest, NextResponse } from "next/server";
import { getAllRates } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rates = await getAllRates(body);
  return NextResponse.json({ rates });
}
