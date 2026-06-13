import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Product, ProductVariant, ProductImage, Review } from "@prisma/client";

type ProductCardProps = {
  product: Product & {
    variants: ProductVariant[];
    images: ProductImage[];
    reviews: Pick<Review, "rating">[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const cheapestVariant = product.variants[0];
  const image = product.images[0];
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;
  const isOnSale = cheapestVariant?.comparePrice && cheapestVariant.comparePrice > cheapestVariant.price;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-3">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No Image
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary">Habis</Badge>
          </div>
        )}
        {isOnSale && inStock && (
          <Badge className="absolute top-2 left-2" variant="destructive">Sale</Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium line-clamp-2 group-hover:underline">{product.name}</p>
        <div className="flex items-center gap-2">
          {cheapestVariant ? (
            <>
              <span className="text-sm font-semibold">{formatCurrency(cheapestVariant.price)}</span>
              {isOnSale && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(cheapestVariant.comparePrice!)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
        {avgRating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-current" />
            <span>{avgRating.toFixed(1)}</span>
            <span>({product.reviews.length})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
