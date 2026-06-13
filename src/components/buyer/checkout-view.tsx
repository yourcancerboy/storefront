"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export function CheckoutView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");

  const handleOrder = async () => {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingCost: 0 }),
    });
    const data = await res.json();
    if (data.orderNumber) {
      router.push(`/orders/${data.orderNumber}`);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Alamat Pengiriman</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nama Penerima</Label><Input className="mt-1.5" placeholder="Nama lengkap" /></div>
                <div><Label>Nomor HP</Label><Input className="mt-1.5" placeholder="+62..." /></div>
              </div>
              <div><Label>Alamat</Label><Input className="mt-1.5" placeholder="Jalan, nomor, RT/RW" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Kecamatan</Label><Input className="mt-1.5" /></div>
                <div><Label>Kota</Label><Input className="mt-1.5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Provinsi</Label><Input className="mt-1.5" /></div>
                <div><Label>Kode Pos</Label><Input className="mt-1.5" /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Metode Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <div className="p-4 border-2 border-foreground rounded-lg flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-foreground" />
                <div>
                  <p className="font-medium text-sm">Transfer Bank</p>
                  <p className="text-xs text-muted-foreground">Invoice & nomor rekening akan dikirim setelah order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Kode Kupon</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Masukkan kode kupon" />
                <Button variant="outline">Pakai</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ringkasan Pesanan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>-</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ongkos Kirim</span><span>-</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon</span><span>-</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span>-</span></div>
              <Button className="w-full" onClick={handleOrder} disabled={loading}>
                {loading ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
