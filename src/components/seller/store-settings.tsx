"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface BankAccount {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
}

export function StoreSettings() {
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { bankName: "", accountNumber: "", accountName: "", isActive: true }
  ]);
  const [saving, setSaving] = useState(false);

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { bankName: "", accountNumber: "", accountName: "", isActive: true }]);
  };

  const updateBank = (i: number, field: keyof BankAccount, value: string | boolean) => {
    setBankAccounts(bankAccounts.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const removeBank = (i: number) => setBankAccounts(bankAccounts.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/seller/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName, storeDescription, storePhone, storeEmail, storeAddress, bankAccounts }),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Toko</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi dan konfigurasi toko</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Toko</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nama Toko</Label>
            <Input className="mt-1.5" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="STOREFRONT" />
          </div>
          <div>
            <Label>Deskripsi Singkat</Label>
            <Textarea className="mt-1.5" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} placeholder="Fashion pilihan berkualitas premium..." />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email Toko</Label>
              <Input className="mt-1.5" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
            </div>
            <div>
              <Label>Nomor HP / WhatsApp</Label>
              <Input className="mt-1.5" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="+62..." />
            </div>
          </div>
          <div>
            <Label>Alamat Toko (untuk pengiriman)</Label>
            <Textarea className="mt-1.5" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Rekening Bank</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addBankAccount}>
              <Plus className="h-3 w-3 mr-1" />Tambah Rekening
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankAccounts.map((bank, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Rekening {i + 1}</p>
                <div className="flex items-center gap-2">
                  <Switch checked={bank.isActive} onCheckedChange={(v) => updateBank(i, "isActive", v)} />
                  {bankAccounts.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeBank(i)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Nama Bank</Label>
                  <Input className="mt-1 h-8 text-sm" value={bank.bankName} onChange={(e) => updateBank(i, "bankName", e.target.value)} placeholder="BCA, Mandiri, BRI..." />
                </div>
                <div>
                  <Label className="text-xs">Nomor Rekening</Label>
                  <Input className="mt-1 h-8 text-sm font-mono" value={bank.accountNumber} onChange={(e) => updateBank(i, "accountNumber", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Nama Pemilik</Label>
                  <Input className="mt-1 h-8 text-sm" value={bank.accountName} onChange={(e) => updateBank(i, "accountName", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Integrasi Pembayaran</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="text-sm font-medium">Bank Transfer Manual</p>
              <p className="text-xs text-muted-foreground">Invoice + verifikasi manual</p>
            </div>
            <Badge variant="success">Aktif</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg opacity-60">
            <div>
              <p className="text-sm font-medium">Xendit</p>
              <p className="text-xs text-muted-foreground">VA, e-wallet, kartu kredit</p>
            </div>
            <Badge variant="outline">Belum Dikonfigurasi</Badge>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </div>
  );
}
