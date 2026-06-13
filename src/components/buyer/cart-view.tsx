"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

type CartItem = {
  id: string;
  quantity: number;
  product: { name: string; slug: string; images: { url: string }[] };
  variant: { name: string; price: number; stock: number };
};

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchCart = () => {
    fetch("/api/cart")
      .then((r) => {
        if (r.status === 401) { setUnauthorized(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) { setItems(d.items || []); setLoading(false); }
      });
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId: string, quantity: number) => {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    fetchCart();
  };

  const removeItem = async (itemId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  if (loading) return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Memuat...</div>;

  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Masuk untuk melihat keranjang</h2>
        <p className="text-muted-foreground mb-6">Keranjang belanja tersimpan saat kamu masuk ke akun.</p>
        <Button asChild><Link href="/auth/login?next=/cart">Masuk</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Keranjang kosong</h2>
        <p className="text-muted-foreground mb-6">Mulai belanja dan tambahkan produk ke keranjang Anda.</p>
        <Button asChild><Link href="/shop">Lanjut Belanja</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border border-border rounded-xl">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.product.images[0] && (
                  <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product.slug}`} className="font-medium hover:underline line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                <p className="text-sm font-semibold mt-1">{formatCurrency(item.variant.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                    disabled={item.quantity >= item.variant.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.variant.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border border-border rounded-xl h-fit space-y-4">
          <h3 className="font-semibold">Ringkasan</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Button className="w-full" asChild>
            <Link href="/checkout">Checkout</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/shop">Lanjut Belanja</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
