import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Package } from "lucide-react";

const SHIPMENT_STATUS: Record<string, { label: string; variant: "secondary" | "default" | "success" | "warning" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  BOOKED: { label: "Terdaftar", variant: "secondary" },
  PICKED_UP: { label: "Diambil", variant: "secondary" },
  IN_TRANSIT: { label: "Dalam Perjalanan", variant: "default" },
  OUT_FOR_DELIVERY: { label: "Dalam Antar", variant: "warning" },
  DELIVERED: { label: "Terkirim", variant: "success" },
  FAILED: { label: "Gagal", variant: "destructive" },
  RETURNED: { label: "Return", variant: "destructive" },
};

export async function ShippingManager() {
  let shipments: any[] = [];
  try {
    shipments = await prisma.shipment.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: { user: { select: { name: true } } },
        },
      },
    });
  } catch {}

  const pendingCount = shipments.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengiriman</h1>
          <p className="text-sm text-muted-foreground">{pendingCount} menunggu proses</p>
        </div>
      </div>

      {/* Status disclaimer */}
      <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground flex gap-3">
        <Truck className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Integrasi Kurir</p>
          <p>JNE, J&T, SiCepat, dan GoSend tersedia dalam mode simulasi. Integrasi API aktif akan segera tersedia setelah akun kurir terdaftar.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Pembeli</TableHead>
              <TableHead>Kurir</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead>No. Resi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Penerima</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Belum ada data pengiriman</TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment) => {
                const statusInfo = SHIPMENT_STATUS[shipment.status] || { label: shipment.status, variant: "secondary" as const };
                return (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-sm">{shipment.order.orderNumber}</TableCell>
                    <TableCell className="text-sm">{shipment.order.user.name || "Guest"}</TableCell>
                    <TableCell className="text-sm font-medium">{shipment.courierCode}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{shipment.courierService}</TableCell>
                    <TableCell className="font-mono text-xs">{shipment.trackingNumber || "-"}</TableCell>
                    <TableCell><Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{shipment.recipientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(shipment.createdAt)}</TableCell>
                    <TableCell>
                      {shipment.status === "PENDING" && (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Package className="h-3 w-3 mr-1" /> Proses
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
