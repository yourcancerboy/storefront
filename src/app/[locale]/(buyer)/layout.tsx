import { BuyerNav } from "@/components/buyer/nav";
import { BuyerFooter } from "@/components/buyer/footer";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <BuyerNav />
      <main className="flex-1">{children}</main>
      <BuyerFooter />
    </div>
  );
}
