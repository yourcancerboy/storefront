import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./auth/user-menu";
import { NavSearch, MobileMenu } from "./nav-client";

export function BuyerNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
            STOREFRONT
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Beranda</Link>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">Toko</Link>
          </nav>

          {/* Actions — mix of server (UserMenu) and client (search, menu) */}
          <div className="flex items-center gap-1">
            <NavSearch />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
              </Link>
            </Button>
            <UserMenu />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
