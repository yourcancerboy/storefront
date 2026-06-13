"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Truck, Tag, ChevronRight, CheckCircle2 } from "lucide-react";

type CartItem = {
  id: string;
  quantity: number;
  product: { name: string; images: { url: string }[] };
  variant: { name: string; price: number; weight: number | null };
};

type ShippingService = {
  code: string;
  name: string;
  description: string;
  estimatedDays: number;
  price: number;
};

type ShippingRate = {
  courier: string;
  services: ShippingService[];
};

type AddressForm = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
};

const EMPTY_ADDRESS: AddressForm = {
  recipientName: "", phone: "", addressLine1: "",
  district: "", city: "", province: "", postalCode: "",
};

export function CheckoutView() {
  const router = useRouter();
  const [step, setStep] = useState<"address" | "shipping" | "payment" | "review">("address");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<{ courier: string; service: ShippingService } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCartItems(d.items || []));
  }, []);

  const subtotal = cartItems.reduce((s, i) => s + i.variant.price * i.quantity, 0);
  const shippingCost = selectedShipping?.service.price ?? 0;
  const total = subtotal + shippingCost - couponDiscount;
  const totalWeight = cartItems.reduce((s, i) => s + (i.variant.weight ?? 300) * i.quantity, 0);

  const addressComplete = Object.values(address).every((v) => v.trim() !== "");

  const fetchRates = async () => {
    setFetchingRates(true);
    setShippingRates([]);
    setSelectedShipping(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { name: "STOREFRONT", phone: "0800", addressLine: "Jakarta", district: "Pusat", city: "Jakarta", province: "DKI Jakarta", postalCode: "10110" },
          destination: { name: address.recipientName, phone: address.phone, addressLine: address.addressLine1, district: address.district, city: address.city, province: address.province, postalCode: address.postalCode },
          items: cartItems.map((i) => ({ name: i.product.name, weight: i.variant.weight ?? 300, quantity: i.quantity, value: i.variant.price })),
          totalWeight,
        }),
      });
      const data = await res.json();
      setShippingRates(data.rates || []);
      setStep("shipping");
    } catch {}
    setFetchingRates(false);
  };

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`/api/promotions/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal + shippingCost }),
      });
      const data = await res.json();
      if (data.error) { setCouponError(data.error); return; }
      setCouponDiscount(data.discount);
      setCouponApplied(true);
    } catch {
      setCouponError("Kode kupon tidak valid.");
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          shippingCost,
          courierCode: selectedShipping?.courier,
          courierService: selectedShipping?.service.code,
          couponCode: couponApplied ? couponCode : undefined,
          discountAmount: couponDiscount,
          notes,
        }),
      });
      const data = await res.json();
      if (data.orderNumber) {
        router.push(`/orders/${data.orderNumber}`);
      } else {
        alert(data.error || "Terjadi kesalahan. Coba lagi.");
      }
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 text-sm mb-8">
      {(["address", "shipping", "payment", "review"] as const).map((s, i) => {
        const labels = ["Alamat", "Pengiriman", "Pembayaran", "Review"];
        const steps = ["address", "shipping", "payment", "review"];
        const current = steps.indexOf(step);
        const isActive = s === step;
        const isDone = steps.indexOf(s) < current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? "bg-foreground text-background" : isDone ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {isDone ? "✓" : i + 1}
            </div>
            <span className={isActive ? "font-medium" : "text-muted-foreground"}>{labels[i]}</span>
            {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      <StepIndicator />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">

          {/* STEP 1: ADDRESS */}
          {step === "address" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Alamat Pengiriman</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Nama Penerima *</Label>
                    <Input className="mt-1.5" value={address.recipientName} onChange={(e) => setAddress({ ...address, recipientName: e.target.value })} placeholder="Nama lengkap" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Nomor HP *</Label>
                    <Input className="mt-1.5" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+62..." />
                  </div>
                </div>
                <div>
                  <Label>Alamat Lengkap *</Label>
                  <Input className="mt-1.5" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} placeholder="Jalan, nomor, RT/RW, kelurahan" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kecamatan *</Label>
                    <Input className="mt-1.5" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                  </div>
                  <div>
                    <Label>Kota *</Label>
                    <Input className="mt-1.5" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Provinsi *</Label>
                    <Input className="mt-1.5" value={address.province} onChange={(e) => setAddress({ ...address, province: e.target.value })} />
                  </div>
                  <div>
                    <Label>Kode Pos *</Label>
                    <Input className="mt-1.5" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" disabled={!addressComplete || fetchingRates} onClick={fetchRates}>
                  {fetchingRates ? "Mengambil tarif pengiriman..." : "Pilih Pengiriman →"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: SHIPPING */}
          {step === "shipping" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pilih Pengiriman</CardTitle>
                  <button onClick={() => setStep("address")} className="text-xs text-muted-foreground hover:text-foreground underline">Ubah Alamat</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingRates.map((rate) =>
                  rate.services.map((service) => {
                    const isSelected = selectedShipping?.courier === rate.courier && selectedShipping?.service.code === service.code;
                    return (
                      <button
                        key={`${rate.courier}-${service.code}`}
                        onClick={() => setSelectedShipping({ courier: rate.courier, service })}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${isSelected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{rate.courier} — {service.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{service.description} · {service.estimatedDays === 0 ? "Hari ini" : `${service.estimatedDays} hari`}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="font-semibold text-sm">{formatCurrency(service.price)}</p>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto mt-1" />}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
                <Button className="w-full mt-2" disabled={!selectedShipping} onClick={() => setStep("payment")}>
                  Pilih Pembayaran →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: PAYMENT */}
          {step === "payment" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Metode Pembayaran</CardTitle>
                  <button onClick={() => setStep("shipping")} className="text-xs text-muted-foreground hover:text-foreground underline">Ubah Pengiriman</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-foreground rounded-xl flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Transfer Bank</p>
                    <p className="text-xs text-muted-foreground">Invoice & nomor rekening dikirim setelah order dibuat</p>
                  </div>
                </div>

                {/* Coupon */}
                <div>
                  <Label>Kode Kupon</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(false); setCouponDiscount(0); setCouponError(""); }}
                      placeholder="KODE KUPON"
                      disabled={couponApplied}
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={applyCoupon} disabled={couponApplied || !couponCode}>
                      {couponApplied ? "✓ Dipakai" : "Pakai"}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                  {couponApplied && <p className="text-xs text-green-600 mt-1">Diskon {formatCurrency(couponDiscount)} berhasil diterapkan!</p>}
                </div>

                <div>
                  <Label>Catatan (opsional)</Label>
                  <Input className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk penjual..." />
                </div>

                <Button className="w-full" onClick={() => setStep("review")}>Review Pesanan →</Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: REVIEW */}
          {step === "review" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Alamat Pengiriman</p>
                  <p className="text-muted-foreground">{address.recipientName} · {address.phone}</p>
                  <p className="text-muted-foreground">{address.addressLine1}, {address.district}, {address.city}, {address.province} {address.postalCode}</p>
                </div>
                <Separator />
                <div className="text-sm space-y-1">
                  <p className="font-medium">Pengiriman</p>
                  <p className="text-muted-foreground">{selectedShipping?.courier} — {selectedShipping?.service.name} ({formatCurrency(shippingCost)})</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product.name} ({item.variant.name}) ×{item.quantity}</span>
                      <span>{formatCurrency(item.variant.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={placeOrder} disabled={loading}>
                  {loading ? "Membuat pesanan..." : "Konfirmasi & Buat Pesanan"}
                </Button>
                <button onClick={() => setStep("payment")} className="w-full text-xs text-center text-muted-foreground hover:text-foreground underline">
                  Kembali
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ringkasan Pesanan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.product.images[0] && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.variant.name} ×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium shrink-0">{formatCurrency(item.variant.price * item.quantity)}</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkos Kirim</span><span>{selectedShipping ? formatCurrency(shippingCost) : "-"}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatCurrency(couponDiscount)}</span></div>}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
