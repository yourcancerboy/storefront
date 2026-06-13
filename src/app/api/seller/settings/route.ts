import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.storeSetting.findMany();
  const bankAccounts = await prisma.bankAccount.findMany({ orderBy: { sortOrder: "asc" } });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json({ settings: map, bankAccounts });
}

export async function POST(req: NextRequest) {
  const { storeName, storeDescription, storePhone, storeEmail, storeAddress, bankAccounts } = await req.json();

  const settingsData = [
    { key: "storeName", value: storeName || "" },
    { key: "storeDescription", value: storeDescription || "" },
    { key: "storePhone", value: storePhone || "" },
    { key: "storeEmail", value: storeEmail || "" },
    { key: "storeAddress", value: storeAddress || "" },
  ];

  await prisma.$transaction([
    ...settingsData.map((s) =>
      prisma.storeSetting.upsert({
        where: { key: s.key },
        create: s,
        update: { value: s.value },
      })
    ),
    prisma.bankAccount.deleteMany(),
    ...((bankAccounts || []) as any[]).map((b: any, i: number) =>
      prisma.bankAccount.create({
        data: {
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountName: b.accountName,
          isActive: b.isActive,
          sortOrder: i,
        },
      })
    ),
  ]);

  return NextResponse.json({ success: true });
}
