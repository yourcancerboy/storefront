import { getUser } from "@/lib/auth/get-user";
import { Package, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Akun Saya</h1>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name || ""} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">{user.name || "Pengguna"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
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

          <div className="flex items-center gap-4 p-4 border border-border rounded-xl opacity-60 cursor-not-allowed">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Alamat Pengiriman</p>
              <p className="text-sm text-muted-foreground">Segera hadir</p>
            </div>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <Button type="submit" variant="outline" className="w-full">
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}
