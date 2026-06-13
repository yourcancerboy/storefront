/**
 * XENDIT WEBHOOK
 * Receives payment notifications from Xendit once configured.
 *
 * Required env: XENDIT_WEBHOOK_TOKEN
 * Docs: https://developers.xendit.co/api-reference/webhooks
 *
 * Events to implement:
 *   invoice.paid, virtual_account.paid, ewallet.capture
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  // TODO: implement handlers per event type
  console.log("[Xendit Webhook] received:", payload.event);

  return NextResponse.json({ received: true });
}
