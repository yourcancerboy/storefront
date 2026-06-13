import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subDays, eachDayOfInterval } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";

  const now = new Date();
  let startDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;

  switch (period) {
    case "7d":
      startDate = subDays(now, 7);
      prevStartDate = subDays(now, 14);
      prevEndDate = subDays(now, 7);
      break;
    case "90d":
      startDate = subDays(now, 90);
      prevStartDate = subDays(now, 180);
      prevEndDate = subDays(now, 90);
      break;
    case "365d":
      startDate = subDays(now, 365);
      prevStartDate = subDays(now, 730);
      prevEndDate = subDays(now, 365);
      break;
    default:
      startDate = subDays(now, 30);
      prevStartDate = subDays(now, 60);
      prevEndDate = subDays(now, 30);
  }

  const [currentOrders, prevOrders, analyticsEvents, topProductsRaw] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: prevStartDate, lte: prevEndDate }, status: { not: "CANCELLED" } },
    }),
    prisma.analyticsEvent.count({
      where: { type: "page_view", createdAt: { gte: startDate } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  const gmv = currentOrders.reduce((s, o) => s + o.total, 0);
  const prevGmv = prevOrders.reduce((s, o) => s + o.total, 0);
  const gmvTrend = prevGmv > 0
    ? { value: Math.round(((gmv - prevGmv) / prevGmv) * 100), label: "vs periode sebelumnya" }
    : null;

  const ordersTrend = prevOrders.length > 0
    ? { value: Math.round(((currentOrders.length - prevOrders.length) / prevOrders.length) * 100), label: "vs periode sebelumnya" }
    : null;

  const unitsSold = currentOrders.reduce(
    (s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0),
    0
  );

  const days = eachDayOfInterval({ start: startDate, end: now });
  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();

  for (const order of currentOrders) {
    const key = format(order.createdAt, "MM/dd");
    revenueByDay.set(key, (revenueByDay.get(key) || 0) + order.total);
    ordersByDay.set(key, (ordersByDay.get(key) || 0) + 1);
  }

  const revenueChart = days.map((d) => ({
    date: format(d, "MM/dd"),
    revenue: revenueByDay.get(format(d, "MM/dd")) || 0,
  }));

  const ordersChart = days.map((d) => ({
    date: format(d, "MM/dd"),
    orders: ordersByDay.get(format(d, "MM/dd")) || 0,
  }));

  const productIds = topProductsRaw.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const topProducts = topProductsRaw.map((r) => ({
    id: r.productId,
    name: products.find((p) => p.id === r.productId)?.name || "Unknown",
    sold: r._sum.quantity || 0,
    revenue: r._sum.subtotal || 0,
  }));

  return NextResponse.json({
    gmv,
    totalOrders: currentOrders.length,
    unitsSold,
    visitors: analyticsEvents,
    gmvTrend,
    ordersTrend,
    revenueChart,
    ordersChart,
    topProducts,
  });
}
