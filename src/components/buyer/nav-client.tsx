"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function NavSearch() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  if (searchOpen) {
    return (
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <Input
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari produk..."
          className="w-48 h-8 text-sm"
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
      <Search className="h-4 w-4" />
    </Button>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {open && (
        <>
          <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)} />
          <div className="md:hidden fixed top-16 left-0 right-0 bg-background border-b border-border px-4 pb-4 pt-3 flex flex-col gap-3 text-sm z-40 shadow-lg">
            <Link href="/" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Beranda</Link>
            <Link href="/shop" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Toko</Link>
            <Link href="/orders" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Pesanan Saya</Link>
            <Link href="/account" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-1">Akun</Link>
          </div>
        </>
      )}
    </>
  );
}
