"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { ProductMediaUpload } from "./product-media-upload";
import type { Product, ProductVariant, ProductImage } from "@prisma/client";

type ProductWithRelations = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};

interface VariantInput {
  id?: string;
  sku: string;
  name: string;
  price: string;
  comparePrice: string;
  stock: string;
  size: string;
  color: string;
  material: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  isActive: boolean;
}

const defaultVariant = (): VariantInput => ({
  sku: "", name: "", price: "", comparePrice: "", stock: "",
  size: "", color: "", material: "", weight: "",
  length: "", width: "", height: "", isActive: true,
});

export function ProductForm({ product }: { product?: ProductWithRelations }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name || "");
  const [nameEn, setNameEn] = useState(product?.nameEn || "");
  const [description, setDescription] = useState(product?.description || "");
  const [descriptionEn, setDescriptionEn] = useState(product?.descriptionEn || "");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">(product?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [tags, setTags] = useState(product?.tags.join(", ") || "");
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: (v.price / 100).toString(),
      comparePrice: v.comparePrice ? (v.comparePrice / 100).toString() : "",
      stock: v.stock.toString(),
      size: v.size || "",
      color: v.color || "",
      material: v.material || "",
      weight: v.weight?.toString() || "",
      length: v.length?.toString() || "",
      width: v.width?.toString() || "",
      height: v.height?.toString() || "",
      isActive: v.isActive,
    })) || [defaultVariant()]
  );

  const addVariant = () => setVariants([...variants, defaultVariant()]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantInput, value: string | boolean) => {
    setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name, nameEn, description, descriptionEn, status, isFeatured,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        ...v,
        price: Math.round(parseFloat(v.price || "0") * 100),
        comparePrice: v.comparePrice ? Math.round(parseFloat(v.comparePrice) * 100) : null,
        stock: parseInt(v.stock || "0"),
        weight: v.weight ? parseInt(v.weight) : null,
        length: v.length ? parseInt(v.length) : null,
        width: v.width ? parseInt(v.width) : null,
        height: v.height ? parseInt(v.height) : null,
      })),
    };

    const url = product ? `/api/seller/products/${product.id}` : "/api/seller/products";
    const method = product ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/seller/products");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Dasar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Produk (ID) *</Label>
              <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Nama Produk (EN)</Label>
              <Input className="mt-1.5" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Deskripsi (ID)</Label>
              <Textarea className="mt-1.5 h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Deskripsi (EN)</Label>
              <Textarea className="mt-1.5 h-32" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: "DRAFT" | "ACTIVE" | "ARCHIVED") => setStatus(v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="ARCHIVED">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <Input className="mt-1.5" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="casual, summer, sale" />
            </div>
            <div className="flex items-end gap-3 pb-0.5">
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
              <Label htmlFor="featured" className="cursor-pointer">Produk Unggulan</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Varian & Stok</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-3 w-3 mr-1" /> Tambah Varian
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {variants.map((variant, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Varian {i + 1}</p>
                {variants.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">SKU *</Label>
                  <Input className="mt-1 h-8 text-sm" value={variant.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Nama Varian *</Label>
                  <Input className="mt-1 h-8 text-sm" value={variant.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="e.g. M / Hitam" required />
                </div>
                <div>
                  <Label className="text-xs">Harga (Rp) *</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" value={variant.price} onChange={(e) => updateVariant(i, "price", e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Harga Coret (Rp)</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" value={variant.comparePrice} onChange={(e) => updateVariant(i, "comparePrice", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs">Stok *</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Ukuran</Label>
                  <Input className="mt-1 h-8 text-sm" value={variant.size} onChange={(e) => updateVariant(i, "size", e.target.value)} placeholder="M, L, XL..." />
                </div>
                <div>
                  <Label className="text-xs">Warna</Label>
                  <Input className="mt-1 h-8 text-sm" value={variant.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Hitam, Putih..." />
                </div>
                <div>
                  <Label className="text-xs">Material</Label>
                  <Input className="mt-1 h-8 text-sm" value={variant.material} onChange={(e) => updateVariant(i, "material", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Berat (gram)</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" min="0" value={variant.weight} onChange={(e) => updateVariant(i, "weight", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Panjang (cm)</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" min="0" value={variant.length} onChange={(e) => updateVariant(i, "length", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Lebar (cm)</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" min="0" value={variant.width} onChange={(e) => updateVariant(i, "width", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Tinggi (cm)</Label>
                  <Input className="mt-1 h-8 text-sm" type="number" min="0" value={variant.height} onChange={(e) => updateVariant(i, "height", e.target.value)} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={variant.isActive} onCheckedChange={(v) => updateVariant(i, "isActive", v)} id={`active-${i}`} />
                <Label htmlFor={`active-${i}`} className="text-xs cursor-pointer">Varian aktif</Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Images/Video */}
      {product && (
        <Card>
          <CardHeader><CardTitle className="text-base">Foto & Video Produk</CardTitle></CardHeader>
          <CardContent>
            <ProductMediaUpload
              productId={product.id}
              initialMedia={product.images.map((img: any) => ({
                id: img.id,
                url: img.url,
                type: img.type || "IMAGE",
                altText: img.altText,
                sortOrder: img.sortOrder,
              }))}
            />
            <p className="text-xs text-muted-foreground mt-3">
              Upload foto/video setelah produk pertama kali disimpan. Maksimal 7 file (gambar + video).
            </p>
          </CardContent>
        </Card>
      )}
      {!product && (
        <Card>
          <CardHeader><CardTitle className="text-base">Foto & Video Produk</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              <p>Simpan produk terlebih dahulu, lalu upload foto & video.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : product ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
      </div>
    </form>
  );
}
