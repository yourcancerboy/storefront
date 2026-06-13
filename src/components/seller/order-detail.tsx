"use client";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAYMENT_VERIFIED: "Pembayaran Dikonfirmasi",
  PROCESSING: "Diproses",
  READY_TO_SHIP: "Siap Dikirim",
  SHIPPED: "Dikirim",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Direfund",
};

const ORDER_STATUSES = ["PENDING_PAYMENT","PAYMENT_VERIFIED","PROCESSING","READY_TO_SHIP","SHIPPED","DELIVERED","COMPLETED","CANCELLED"];

export function SellerOrderDetail({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status);
  const [paymentNote, setPaymentNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(order.shipment?.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    const res = await fetch("/api/seller/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status: newStatus }),
    });
    if (res.ok) { setStatus(newStatus); setMsg("Status diperbarui."); }
    setSaving(false);
  };

  const verifyPayment = async (approved: boolean) => {
    setSaving(true);
    const res = await fetch("/api/seller/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, approved, notes: paymentNote }),
    });
    if (res.ok) { setMsg(approved ? "Pembayaran dikonfirmasi." : "Pembayaran ditolak."); }
    setSaving(false);
  };

  const saveTracking = async () => {
    if (!order.shipment?.id) return;
    setSaving(true);
    await fetch(`/api/seller/shipments/${order.shipment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber }),
    });
    setMsg("No. resi disimpan.");
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className="ml-auto">{STATUS_LABELS[status] || status}</Badge>
      </div>

      {msg && <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Pembeli</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{order.user.name || "Guest"}</p>
            <p className="text-muted-foreground">{order.user.email}</p>
            {order.user.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
          </CardContent>
        </Card>

        {order.address && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />Alamat Pengiriman</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.address.recipientName}</p>
              <p className="text-muted-foreground">{order.address.phone}</p>
              <p className="text-muted-foreground">{order.address.addressLine1}, {order.address.district}, {order.address.city}</p>
              <p className="text-muted-foreground">{order.address.province} {order.address.postalCode}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" />Pembayaran</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span className="font-mono text-xs">{order.payment?.invoiceNumber || "-"}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Status</span>
                <Badge variant={order.payment?.status === "PAID" ? "success" : "warning"} className="text-xs">{order.payment?.status || "UNPAID"}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatCurrency(order.total)}</span></div>
            </div>
            {order.payment?.status === "PENDING_VERIFICATION" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-medium">Verifikasi Pembayaran</p>
                <Input placeholder="Catatan (opsional)" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="h-8 text-xs" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => verifyPayment(true)} disabled={saving}>Konfirmasi</Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => verifyPayment(false)} disabled={saving}>Tolak</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" />Pengiriman</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.shipment ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Kurir</span><span>{order.shipment.courierCode} — {order.shipment.courierService}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ongkos</span><span>{formatCurrency(order.shipment.shippingCost)}</span></div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Resi</Label>
                  <div className="flex gap-2">
                    <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Masukkan no. resi" className="h-8 text-sm font-mono" />
                    <Button size="sm" onClick={saveTracking} disabled={saving}>Simpan</Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Belum ada info pengiriman.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4" />Produk Dipesan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.variantName} · SKU: {item.sku} · ×{item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ongkos Kirim</span><span>{formatCurrency(order.shippingCost)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
            <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Update Status Pesanan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => updateStatus(status)} disabled={saving || status === order.status}>
              {saving ? "Menyimpan..." : "Update"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
