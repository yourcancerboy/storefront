"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Truck, Tag, BarChart3,
  Settings, Users, ChevronRight, Store
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/seller/products", label: "Produk", icon: Package },
  { href: "/seller/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/seller/shipping", label: "Pengiriman", icon: Truck },
  { href: "/seller/promotions", label: "Promosi", icon: Tag },
  { href: "/seller/insights", label: "Insight Bisnis", icon: BarChart3 },
  { href: "/seller/settings", label: "Pengaturan", icon: Settings },
  { href: "/seller/accounts", label: "Akun", icon: Users },
];

export function SellerSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, ""); // strip locale prefix
    return exact ? cleanPath === href : cleanPath.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex w-64 min-h-screen flex-col border-r border-border bg-background shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/seller" className="flex items-center gap-2 font-bold text-lg">
          <Store className="h-5 w-5" />
          <span>Seller Panel</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
              isActive(item.href, item.exact)
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive(item.href, item.exact) && <ChevronRight className="h-3 w-3" />}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-2">
          ← Lihat Toko
        </Link>
      </div>
    </aside>
  );
}
