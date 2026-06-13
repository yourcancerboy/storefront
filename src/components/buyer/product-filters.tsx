"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@prisma/client";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COLORS = ["Hitam", "Putih", "Abu-abu", "Navy", "Merah", "Biru", "Hijau", "Kuning", "Pink"];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilters = () => {
    const q = searchParams.get("q");
    router.push(q ? `?q=${q}` : "?");
  };

  const hasFilters = ["category", "minPrice", "maxPrice", "size", "color", "inStock"].some(
    (k) => searchParams.has(k)
  );

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </h3>
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Kategori</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={searchParams.get("category") === cat.slug}
                onCheckedChange={(checked) =>
                  updateFilter("category", checked ? cat.slug : null)
                }
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal cursor-pointer">
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-3">Harga</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-8 text-sm"
            value={searchParams.get("minPrice") || ""}
            onChange={(e) => updateFilter("minPrice", e.target.value || null)}
          />
          <span className="text-muted-foreground text-sm">-</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-8 text-sm"
            value={searchParams.get("maxPrice") || ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value || null)}
          />
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-3">Ukuran</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() =>
                updateFilter("size", searchParams.get("size") === size ? null : size)
              }
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                searchParams.get("size") === size
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-3">Warna</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() =>
                updateFilter("color", searchParams.get("color") === color ? null : color)
              }
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                searchParams.get("color") === color
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="inStock"
          checked={searchParams.get("inStock") === "true"}
          onCheckedChange={(checked) => updateFilter("inStock", checked ? "true" : null)}
        />
        <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
          Tersedia saja
        </Label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filter
          {hasFilters && <span className="bg-foreground text-background text-xs rounded-full px-1.5 py-0.5">!</span>}
        </Button>
        {open && (
          <div className="mt-4 p-4 border border-border rounded-xl bg-background">{content}</div>
        )}
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:block p-4 border border-border rounded-xl bg-background sticky top-24">
        {content}
      </div>
    </>
  );
}
