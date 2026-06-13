import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { ShoppingBag, TrendingUp, Package, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function DashboardOverview() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  let totalOrdersThisMonth = 0, totalOrdersLastMonth = 0, totalProducts = 0;
  let revenueThisMonth: { _sum: { total: number | null } } = { _sum: { total: null } };
  let revenueLastMonth: { _sum: { total: number | null } } = { _sum: { total: null } };
  let recentOrders: any[] = [];
  let lowStockVariants: any[] = [];

  try {
    [
      totalOrdersThisMonth,
      totalOrdersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalProducts,
      recentOrders,
      lowStockVariants,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } }, items: { take: 1 } },
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5, gt: 0 }, isActive: true },
        include: { product: { select: { name: true } } },
        take: 5,
        orderBy: { stock: "asc" },
      }),
    ]);
  } catch {}

  const gmv = revenueThisMonth._sum.total || 0;
  const gmvLast = revenueLastMonth._sum.total || 0;
  const gmvTrend = gmvLast > 0 ? Math.round(((gmv - gmvLast) / gmvLast) * 100) : 0;
  const orderTrend = totalOrdersLastMonth > 0
    ? Math.round(((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth) * 100)
    : 0;

  const STATUS_LABELS: Record<string, string> = {
    PENDING_PAYMENT: "Menunggu Bayar",
    PAYMENT_VERIFIED: "Bayar Dikonfirmasi",
    PROCESSING: "Diproses",
    READY_TO_SHIP: "Siap Kirim",
    SHIPPED: "Dikirim",
    DELIVERED: "Terkirim",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Ringkasan bisnis bulan ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="GMV Bulan Ini"
          value={formatCurrency(gmv)}
          icon={TrendingUp}
          trend={{ value: gmvTrend, label: "vs bulan lalu" }}
        />
        <StatCard
          title="Pesanan Bulan Ini"
          value={totalOrdersThisMonth.toString()}
          icon={ShoppingBag}
          trend={{ value: orderTrend, label: "vs bulan lalu" }}
        />
        <StatCard
          title="Produk Aktif"
          value={totalProducts.toString()}
          icon={Package}
        />
        <StatCard
          title="Rata-rata Order"
          value={totalOrdersThisMonth > 0 ? formatCurrency(Math.round(gmv / totalOrdersThisMonth)) : "-"}
          icon={Users}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Pesanan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.user.name || "Guest"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <Badge variant="secondary" className="text-xs">{STATUS_LABELS[order.status] || order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Stok Hampir Habis</CardTitle></CardHeader>
          <CardContent>
            {lowStockVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Semua stok aman</p>
            ) : (
              <div className="space-y-3">
                {lowStockVariants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium line-clamp-1">{v.product.name}</p>
                      <p className="text-xs text-muted-foreground">{v.name} · SKU: {v.sku}</p>
                    </div>
                    <Badge variant={v.stock <= 2 ? "destructive" : "warning"}>
                      {v.stock} tersisa
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
