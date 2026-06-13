"use client";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SellerHeader() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground hidden sm:block">
          Selamat datang kembali
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
          A
        </div>
      </div>
    </header>
  );
}
