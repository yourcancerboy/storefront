import { ProductGrid } from "@/components/buyer/product-grid";
import { ProductFilters } from "@/components/buyer/product-filters";
import { ProductSort } from "@/components/buyer/product-sort";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    inStock?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(params.category && { category: { slug: params.category } }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ],
    }),
    ...(params.inStock === "true" && {
      variants: { some: { stock: { gt: 0 }, isActive: true } },
    }),
    ...(params.size && {
      variants: { some: { size: params.size, isActive: true } },
    }),
    ...(params.color && {
      variants: { some: { color: { contains: params.color, mode: "insensitive" }, isActive: true } },
    }),
    ...((params.minPrice || params.maxPrice) && {
      variants: {
        some: {
          isActive: true,
          price: {
            ...(params.minPrice ? { gte: parseInt(params.minPrice) * 100 } : {}),
            ...(params.maxPrice ? { lte: parseInt(params.maxPrice) * 100 } : {}),
          },
        },
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (params.sort) {
      case "oldest": return { createdAt: "asc" as const };
      default: return { createdAt: "desc" as const };
    }
  })();

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters categories={categories} />
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{total} produk</p>
            <ProductSort />
          </div>
          <ProductGrid products={products} />
          {total > pageSize && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
                <a
                  key={i}
                  href={`?${new URLSearchParams({ ...params, page: String(i + 1) })}`}
                  className={`px-3 py-1 rounded border text-sm ${page === i + 1 ? "bg-foreground text-background" : "hover:bg-muted"}`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
