import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Tag, Percent, DollarSign, Truck, Gift } from "lucide-react";

const TYPE_ICONS = { PERCENTAGE: Percent, FIXED_AMOUNT: DollarSign, FREE_SHIPPING: Truck, BUY_X_GET_Y: Gift };
const TYPE_LABELS = { PERCENTAGE: "Persentase", FIXED_AMOUNT: "Nominal", FREE_SHIPPING: "Gratis Ongkir", BUY_X_GET_Y: "Beli X Gratis Y" };

export async function PromotionsManager() {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const active = promotions.filter((p) => p.isActive && p.startsAt <= now && p.endsAt >= now);
  const upcoming = promotions.filter((p) => p.startsAt > now);
  const expired = promotions.filter((p) => p.endsAt < now);

  const PromoCard = ({ promo }: { promo: typeof promotions[0] }) => {
    const Icon = TYPE_ICONS[promo.type] || Tag;
    const isActive = promo.isActive && promo.startsAt <= now && promo.endsAt >= now;
    const isExpired = promo.endsAt < now;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{promo.name}</p>
                <p className="text-xs text-muted-foreground">{TYPE_LABELS[promo.type]}</p>
              </div>
            </div>
            <Badge variant={isActive ? "success" : isExpired ? "outline" : "secondary"}>
              {isActive ? "Aktif" : isExpired ? "Kedaluwarsa" : "Terjadwal"}
            </Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="block font-medium text-foreground">
                {promo.type === "PERCENTAGE" ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
              </span>
              Nilai Diskon
            </div>
            {promo.code && (
              <div>
                <span className="block font-mono font-medium text-foreground">{promo.code}</span>
                Kode Kupon
              </div>
            )}
            <div>
              <span className="block text-foreground">{promo._count.orders}</span>
              Digunakan
            </div>
            {promo.usageLimit && (
              <div>
                <span className="block text-foreground">{promo.usageLimit}</span>
                Limit
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(promo.startsAt)} — {formatDate(promo.endsAt)}</span>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
              <Link href={`/seller/promotions/${promo.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promosi</h1>
          <p className="text-sm text-muted-foreground">{active.length} promosi aktif</p>
        </div>
        <Button asChild>
          <Link href="/seller/promotions/new"><Plus className="h-4 w-4 mr-2" />Buat Promosi</Link>
        </Button>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Aktif Sekarang</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((p) => <PromoCard key={p.id} promo={p} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Terjadwal</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((p) => <PromoCard key={p.id} promo={p} />)}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Kedaluwarsa</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expired.map((p) => <PromoCard key={p.id} promo={p} />)}
          </div>
        </div>
      )}

      {promotions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium mb-2">Belum ada promosi</p>
          <Button asChild><Link href="/seller/promotions/new">Buat Promosi Pertama</Link></Button>
        </div>
      )}
    </div>
  );
}
