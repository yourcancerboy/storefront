import Link from "next/link";

export function BuyerFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold tracking-tight mb-3">STOREFRONT</p>
            <p className="text-sm text-muted-foreground">Fashion pilihan berkualitas premium untuk gaya hidup modern.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Belanja</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-foreground transition-colors">Semua Produk</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-foreground transition-colors">Terbaru</Link></li>
              <li><Link href="/shop?isFeatured=true" className="hover:text-foreground transition-colors">Featured</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Akun</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/account" className="hover:text-foreground transition-colors">Profil Saya</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">Pesanan Saya</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Bantuan</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Hubungi Kami</Link></li>
              <li><Link href="/returns" className="hover:text-foreground transition-colors">Pengembalian</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Storefront. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-foreground">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
