import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function PromosBanner() {
  const promos = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  if (promos.length === 0) return null;

  return (
    <section className="bg-foreground text-background py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-center">
          {promos.map((promo) => (
            <div key={promo.id} className="flex items-center gap-2">
              <span className="font-semibold">{promo.name}</span>
              {promo.code && (
                <span className="bg-background/20 px-2 py-0.5 rounded font-mono text-xs">
                  {promo.code}
                </span>
              )}
              <span className="text-background/70 text-xs">s/d {formatDate(promo.endsAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
