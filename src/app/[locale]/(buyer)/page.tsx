import { HeroSection } from "@/components/buyer/hero-section";
import { FeaturedProducts } from "@/components/buyer/featured-products";
import { CategoryGrid } from "@/components/buyer/category-grid";
import { NewArrivals } from "@/components/buyer/new-arrivals";
import { PromosBanner } from "@/components/buyer/promos-banner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromosBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <NewArrivals />
    </>
  );
}
