"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAYMENT_VERIFIED: "Pembayaran Dikonfirmasi",
  PROCESSING: "Diproses",
  READY_TO_SHIP: "Siap Dikirim",
  SHIPPED: "Dalam Pengiriman",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Direfund",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  PENDING_PAYMENT: "warning",
  PAYMENT_VERIFIED: "success",
  PROCESSING: "secondary",
  READY_TO_SHIP: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

export function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/my")
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center text-muted-foreground py-8">Memuat...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium mb-2">Belum ada pesanan</p>
        <Button asChild><Link href="/shop">Mulai Belanja</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
            <Badge variant={STATUS_VARIANTS[order.status] || "secondary"}>
              {STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{order.items?.length || 0} produk</span>
            <span>·</span>
            <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orders/${order.orderNumber}`}>Lihat Detail</Link>
            </Button>
            {order.status === "PENDING_PAYMENT" && (
              <Button size="sm" asChild>
                <Link href={`/invoice/${order.orderNumber}`}>Bayar Sekarang</Link>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
