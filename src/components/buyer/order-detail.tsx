import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export function OrderDetail({ order }: { order: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
          <p className="text-sm text-muted-foreground">#{order.orderNumber}</p>
        </div>
        <Badge>{STATUS_LABELS[order.status] || order.status}</Badge>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Produk yang Dipesan</h3>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.productName} — {item.variantName} x{item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ongkos Kirim</span><span>{formatCurrency(order.shippingCost)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Diskon</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
          <Separator className="my-3" />
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>

        {order.address && (
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Alamat Pengiriman</h3>
            <p className="text-sm">{order.address.recipientName}</p>
            <p className="text-sm text-muted-foreground">{order.address.addressLine1}, {order.address.district}, {order.address.city}</p>
          </div>
        )}

        {order.shipment && (
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Info Pengiriman</h3>
            <p className="text-sm">Kurir: {order.shipment.courierCode} — {order.shipment.courierService}</p>
            {order.shipment.trackingNumber && <p className="text-sm">No. Resi: <span className="font-mono">{order.shipment.trackingNumber}</span></p>}
          </div>
        )}

        {order.status === "PENDING_PAYMENT" && (
          <Button asChild className="w-full">
            <Link href={`/invoice/${order.orderNumber}`}>Bayar Sekarang</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
