import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Eye } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Bayar",
  PAYMENT_VERIFIED: "Bayar OK",
  PROCESSING: "Diproses",
  READY_TO_SHIP: "Siap Kirim",
  SHIPPED: "Dikirim",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Direfund",
};

export async function OrdersManager() {
  const orders = await prisma.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { quantity: true, productName: true }, take: 1 },
      payment: { select: { status: true } },
      shipment: { select: { status: true, trackingNumber: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pesanan</h1>
          <p className="text-sm text-muted-foreground">{orders.length} pesanan terbaru</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Cari no. pesanan / nama..." className="max-w-xs h-9 text-sm" />
        <Select>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="Semua Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pembeli</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status Order</TableHead>
              <TableHead>Status Bayar</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Belum ada pesanan</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{order.user.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{STATUS_LABELS[order.status] || order.status}</Badge></TableCell>
                  <TableCell>
                    <Badge
                      variant={order.payment?.status === "PAID" ? "success" : order.payment?.status === "PENDING_VERIFICATION" ? "warning" : "outline"}
                      className="text-xs"
                    >
                      {order.payment?.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/seller/orders/${order.orderNumber}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
