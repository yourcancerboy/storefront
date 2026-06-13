import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-secondary">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 border border-border px-3 py-1 rounded-full">
            Koleksi Terbaru
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
            Temukan<br />
            Gaya<br />
            Terbaik Anda
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Eksplorasi koleksi fashion pilihan dengan kualitas premium dan harga terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link href="/shop">
                Belanja Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">Lihat Koleksi</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative background */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-muted hidden lg:block" />
    </section>
  );
}
