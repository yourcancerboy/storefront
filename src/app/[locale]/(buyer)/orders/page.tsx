import { OrdersList } from "@/components/buyer/orders-list";

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>
      <OrdersList />
    </div>
  );
}
