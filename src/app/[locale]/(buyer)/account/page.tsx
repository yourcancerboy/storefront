import { User, Package, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Akun Saya</h1>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Guest</p>
              <p className="text-sm text-muted-foreground">Belum masuk</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          <Link href="/orders" className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted transition-colors">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Pesanan Saya</p>
              <p className="text-sm text-muted-foreground">Lihat riwayat dan status pesanan</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Alamat Pengiriman</p>
              <p className="text-sm text-muted-foreground">Kelola alamat pengiriman Anda</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Masuk / Daftar
          </Button>
        </div>
      </div>
    </div>
  );
}
