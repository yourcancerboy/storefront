/**
 * EMAIL NOTIFICATIONS
 * Uses Resend (https://resend.com) — free tier: 3,000 emails/month.
 *
 * Setup:
 * 1. Create account at resend.com
 * 2. Add RESEND_API_KEY to .env.local
 * 3. Add RESEND_FROM_EMAIL to .env.local (e.g. "Storefront <noreply@yourdomain.com>")
 *    Note: on free tier, use onboarding@resend.dev as from address
 */

import { Resend } from "resend";
import { formatCurrency } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  total: number;
  customerName: string;
  customerEmail: string;
  items: { productName: string; variantName: string; quantity: number; subtotal: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured

  const itemRows = order.items.map((i) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.productName} (${i.variantName}) ×${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatCurrency(i.subtotal)}</td></tr>`
  ).join("");

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pesanan #${order.orderNumber} Berhasil Dibuat`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">Terima kasih, ${order.customerName || "Pelanggan"}! 🎉</h2>
        <p style="color:#666">Pesanan kamu telah berhasil dibuat dan sedang menunggu pembayaran.</p>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0 0 4px;font-size:12px;color:#999">NO. PESANAN</p>
          <p style="margin:0;font-weight:700;font-size:18px">#${order.orderNumber}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr><td style="padding:12px 0;font-weight:700">Total</td><td style="padding:12px 0;font-weight:700;text-align:right">${formatCurrency(order.total)}</td></tr>
          </tfoot>
        </table>
        <div style="margin:24px 0;text-align:center">
          <a href="${APP_URL}/orders/${order.orderNumber}" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Lihat Invoice & Cara Bayar
          </a>
        </div>
        <p style="color:#999;font-size:12px">Selesaikan pembayaran dalam 2×24 jam agar pesanan diproses.</p>
      </div>
    `,
  });
}

export async function sendPaymentVerifiedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pembayaran #${order.orderNumber} Dikonfirmasi ✓`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2>Pembayaran Dikonfirmasi! ✓</h2>
        <p style="color:#666">Hei ${order.customerName || "Pelanggan"}, pembayaran pesanan <strong>#${order.orderNumber}</strong> sudah kami terima dan dikonfirmasi.</p>
        <p style="color:#666">Pesanan kamu sedang kami siapkan untuk pengiriman.</p>
        <div style="margin:24px 0;text-align:center">
          <a href="${APP_URL}/orders/${order.orderNumber}" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Pantau Status Pesanan
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendOrderShippedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  courierName: string;
  trackingNumber: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `Pesanan #${order.orderNumber} Sedang Dikirim 🚚`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2>Pesanan Sedang Dikirim! 🚚</h2>
        <p style="color:#666">Hei ${order.customerName || "Pelanggan"}, pesanan <strong>#${order.orderNumber}</strong> sudah dikirim oleh <strong>${order.courierName}</strong>.</p>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0 0 4px;font-size:12px;color:#999">NO. RESI</p>
          <p style="margin:0;font-weight:700;font-size:18px;font-family:monospace">${order.trackingNumber}</p>
        </div>
        <div style="margin:24px 0;text-align:center">
          <a href="${APP_URL}/orders/${order.orderNumber}" style="background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Lacak Pesanan
          </a>
        </div>
      </div>
    `,
  });
}
