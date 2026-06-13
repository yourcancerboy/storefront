import { prisma } from "@/lib/prisma";
import { ProductCard } from "./product-card";

export async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: {
      variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      reviews: { select: { rating: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold mb-8">Produk Unggulan</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
