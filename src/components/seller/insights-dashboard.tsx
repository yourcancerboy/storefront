"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, ShoppingBag, Package, Users, Eye } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

type Period = "7d" | "30d" | "90d" | "365d" | "custom";

export function InsightsDashboard() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seller/insights?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const PERIOD_LABELS: Record<Period, string> = {
    "7d": "7 Hari Terakhir",
    "30d": "30 Hari Terakhir",
    "90d": "90 Hari Terakhir",
    "365d": "1 Tahun Terakhir",
    "custom": "Kustom",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insight Bisnis</h1>
          <p className="text-sm text-muted-foreground">Analisis performa toko Anda</p>
        </div>
        <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(PERIOD_LABELS) as Period[]).map((k) => (
              <SelectItem key={k} value={k}>{PERIOD_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total GMV" value={formatCurrency(data?.gmv || 0)} icon={TrendingUp} trend={data?.gmvTrend} />
            <StatCard title="Total Pesanan" value={(data?.totalOrders || 0).toString()} icon={ShoppingBag} trend={data?.ordersTrend} />
            <StatCard title="Produk Terjual" value={(data?.unitsSold || 0).toString()} icon={Package} />
            <StatCard title="Total Pengunjung" value={(data?.visitors || 0).toString()} icon={Eye} />
          </div>

          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
              <TabsTrigger value="orders">Pesanan</TabsTrigger>
              <TabsTrigger value="products">Produk Terlaris</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader><CardTitle className="text-base">Grafik Pendapatan</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data?.revenueChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => formatCurrency(v as number)} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} name="GMV" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader><CardTitle className="text-base">Jumlah Pesanan</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data?.ordersChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} name="Pesanan" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader><CardTitle className="text-base">Produk Terlaris</CardTitle></CardHeader>
                <CardContent>
                  {(data?.topProducts || []).length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Belum ada data</p>
                  ) : (
                    <div className="space-y-3">
                      {(data?.topProducts || []).map((product: any, i: number) => (
                        <div key={product.id} className="flex items-center gap-4">
                          <span className="w-6 text-sm font-bold text-muted-foreground">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <div className="mt-1 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-foreground rounded-full"
                                style={{ width: `${(product.sold / (data.topProducts[0]?.sold || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">{product.sold} terjual</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
