/**
 * PAYMENT ADAPTER LAYER
 *
 * Current status: Bank Transfer (manual invoice) is LIVE.
 * Xendit integration is STUBBED — interface is defined, ready to implement.
 *
 * To connect Xendit:
 * 1. Add XENDIT_SECRET_KEY and XENDIT_WEBHOOK_TOKEN to .env.local
 * 2. Implement XenditAdapter in ./adapters/xendit.ts
 * 3. Use createVirtualAccount() for VA payments
 * 4. Wire up the webhook at /api/webhooks/xendit/route.ts
 *
 * Xendit docs: https://developers.xendit.co
 * Midtrans docs: https://docs.midtrans.com (alternative)
 */

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils";

export * from "./types";

export async function createBankTransferInvoice(
  orderId: string,
  orderNumber: string,
  amount: number
) {
  const invoiceNumber = generateInvoiceNumber();
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000 * 2); // 2 days

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  await prisma.payment.create({
    data: {
      orderId,
      amount,
      method: "BANK_TRANSFER",
      status: "UNPAID",
      invoiceNumber,
      dueDate,
      bankName: bankAccounts[0]?.bankName,
      accountNumber: bankAccounts[0]?.accountNumber,
      accountName: bankAccounts[0]?.accountName,
    },
  });

  return { invoiceNumber, dueDate, bankAccounts };
}

// Stub: implement when Xendit credentials are ready
export async function createXenditVA(_orderId: string, _amount: number, _customerName: string) {
  throw new Error("Xendit VA not yet configured. Add XENDIT_SECRET_KEY to .env.local.");
}
