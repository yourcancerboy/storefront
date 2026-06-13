"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Zap, Star, Package, Ruler, Weight } from "lucide-react";
import type { Product, ProductVariant, ProductImage, Review, User, Category } from "@prisma/client";

type Props = {
  product: Product & {
    variants: ProductVariant[];
    images: ProductImage[];
    reviews: (Review & { user: Pick<User, "name" | "avatarUrl"> })[];
    category: Category | null;
  };
};

export function ProductDetail({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const addToCart = async () => {
    if (!selectedVariant) return;
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, variantId: selectedVariant.id, quantity }),
    });
    if (res.status === 401) {
      window.location.href = `/auth/login?next=/shop/${product.slug}`;
      return;
    }
    // TODO: show success toast
    alert("Produk berhasil ditambahkan ke keranjang!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images & Video */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted relative">
            {product.images[selectedImage] ? (
              (product.images[selectedImage] as any).type === "VIDEO" ? (
                <video
                  src={product.images[selectedImage].url}
                  controls
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : (
                <img
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors relative ${idx === selectedImage ? "border-foreground" : "border-border"}`}
                >
                  {img.type === "VIDEO" ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <svg className="h-5 w-5 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  ) : (
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= avgRating ? "fill-current" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews.length} ulasan)</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {selectedVariant && (
              <>
                <span className="text-3xl font-bold">{formatCurrency(selectedVariant.price)}</span>
                {selectedVariant.comparePrice && selectedVariant.comparePrice > selectedVariant.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrency(selectedVariant.comparePrice)}
                    </span>
                    <Badge variant="destructive">
                      -{Math.round((1 - selectedVariant.price / selectedVariant.comparePrice) * 100)}%
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Size selector */}
          {product.variants.some((v) => v.size) && (
            <div>
              <p className="text-sm font-medium mb-3">Pilih Ukuran</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  variant.size && (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedVariant?.id === variant.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {variant.size}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-3">Jumlah</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >-</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >+</button>
              {selectedVariant && (
                <span className="text-sm text-muted-foreground">
                  Stok: {selectedVariant.stock}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={!inStock}
              onClick={addToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Tambah ke Keranjang
            </Button>
            <Button size="lg" className="flex-1" disabled={!inStock}>
              <Zap className="mr-2 h-4 w-4" />
              Beli Sekarang
            </Button>
          </div>

          {!inStock && (
            <p className="text-sm text-destructive font-medium">Stok habis</p>
          )}

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Product details */}
          {selectedVariant && (selectedVariant.weight || selectedVariant.size) && (
            <div>
              <h3 className="font-semibold mb-3">Detail Produk</h3>
              <div className="space-y-2 text-sm">
                {selectedVariant.sku && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-mono">{selectedVariant.sku}</span>
                  </div>
                )}
                {selectedVariant.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Weight className="h-3 w-3" /> Berat</span>
                    <span>{selectedVariant.weight}g</span>
                  </div>
                )}
                {selectedVariant.length && selectedVariant.width && selectedVariant.height && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Ruler className="h-3 w-3" /> Dimensi</span>
                    <span>{selectedVariant.length} × {selectedVariant.width} × {selectedVariant.height} cm</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Ulasan ({product.reviews.length})</h2>
          <div className="grid gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {review.user.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user.name || "Anonim"}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`h-3 w-3 ${i <= review.rating ? "fill-current" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
