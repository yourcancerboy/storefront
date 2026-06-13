import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";

export async function NewArrivals() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        reviews: { select: { rating: true } },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Terbaru</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/shop?sort=newest">Lihat Semua</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
