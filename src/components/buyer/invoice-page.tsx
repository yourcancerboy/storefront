import { formatCurrency, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function InvoicePage({ order }: { order: any }) {
  const payment = order.payment;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="border border-border rounded-xl p-8 space-y-6 print:border-none">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">STOREFRONT</h1>
            <p className="text-sm text-muted-foreground mt-1">Invoice Pembayaran</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold">{payment?.invoiceNumber || "-"}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
            <Badge className="mt-1">
              {payment?.status === "PAID" ? "Lunas" : "Belum Dibayar"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div>
          <h3 className="font-semibold mb-3">Detail Pesanan #{order.orderNumber}</h3>
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.productName} ({item.variantName}) × {item.quantity}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ongkos Kirim</span><span>{formatCurrency(order.shippingCost)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Pembayaran</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Payment info */}
        {payment && payment.status !== "PAID" && (
          <div className="bg-muted rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">Informasi Pembayaran</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Batas Pembayaran</span><span className="font-medium text-red-600">{formatDate(payment.dueDate)}</span></div>
            </div>
            {payment.bankName && (
              <div className="border border-border rounded-lg p-3 bg-background">
                <p className="text-xs text-muted-foreground mb-1">Transfer ke:</p>
                <p className="font-bold">{payment.bankName}</p>
                <p className="font-mono text-xl font-bold tracking-wider mt-1">{payment.accountNumber}</p>
                <p className="text-sm text-muted-foreground">a/n {payment.accountName}</p>
              </div>
            )}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Transfer sejumlah tepat ke rekening di atas</p>
              <p>2. Simpan bukti transfer Anda</p>
              <p>3. Pesanan akan diproses setelah pembayaran dikonfirmasi</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 print:hidden">
          <Button variant="outline" onClick={() => window.print()} className="flex-1">Cetak Invoice</Button>
          <Button asChild className="flex-1"><Link href="/orders">Lihat Pesanan</Link></Button>
        </div>
      </div>
    </div>
  );
}
