import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, ProductVariant, ProductImage, Review, Category } from "@prisma/client";

type Props = {
  products: (Product & {
    variants: ProductVariant[];
    images: ProductImage[];
    reviews: Pick<Review, "rating">[];
    category: Category | null;
  })[];
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium mb-2">Tidak ada produk ditemukan</p>
        <p className="text-sm">Coba ubah filter pencarian Anda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
