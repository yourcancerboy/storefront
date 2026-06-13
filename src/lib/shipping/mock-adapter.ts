import type { CourierAdapter, CourierCode, ShippingRateRequest, ShippingRateResponse, BookShipmentRequest, BookShipmentResponse, TrackingResponse } from "./types";

// Mock data for development — replace with real API calls per courier
const MOCK_SERVICES: Record<CourierCode, { code: string; name: string; description: string; days: number; baseCost: number }[]> = {
  JNE: [
    { code: "REG", name: "Reguler", description: "Pengiriman reguler", days: 3, baseCost: 9000 },
    { code: "YES", name: "Yakin Esok Sampai", description: "Garansi sampai besok", days: 1, baseCost: 25000 },
    { code: "OKE", name: "Ongkos Kirim Ekonomis", description: "Hemat lebih ekonomis", days: 5, baseCost: 7000 },
  ],
  JNT: [
    { code: "EZ", name: "J&T EZ", description: "Pengiriman express", days: 2, baseCost: 10000 },
    { code: "ECO", name: "J&T Economy", description: "Hemat dan terjangkau", days: 4, baseCost: 8000 },
  ],
  SICEPAT: [
    { code: "REG", name: "Reguler", description: "Pengiriman reguler SiCepat", days: 3, baseCost: 9000 },
    { code: "BEST", name: "BEST", description: "Besok sudah tiba", days: 1, baseCost: 20000 },
    { code: "HALU", name: "HALU", description: "Hari ini sampai", days: 0, baseCost: 35000 },
  ],
  GOSEND: [
    { code: "INSTANT", name: "Instant Delivery", description: "Antar dalam 3 jam", days: 0, baseCost: 15000 },
    { code: "SAMEDAY", name: "Same Day Delivery", description: "Sampai hari ini", days: 0, baseCost: 20000 },
  ],
};

function calculatePrice(baseCost: number, weightGrams: number): number {
  const weightKg = Math.ceil(weightGrams / 1000);
  return baseCost * Math.max(1, weightKg);
}

export class MockCourierAdapter implements CourierAdapter {
  constructor(public courier: CourierCode) {}

  async getRates(request: ShippingRateRequest): Promise<ShippingRateResponse> {
    await new Promise((r) => setTimeout(r, 200)); // simulate API latency
    const services = MOCK_SERVICES[this.courier].map((s) => ({
      code: s.code,
      name: s.name,
      description: s.description,
      estimatedDays: s.days,
      price: calculatePrice(s.baseCost, request.totalWeight),
    }));
    return { courier: this.courier, services };
  }

  async bookShipment(request: BookShipmentRequest): Promise<BookShipmentResponse> {
    await new Promise((r) => setTimeout(r, 300));
    const trackingNumber = `${this.courier}${Date.now().toString().slice(-10)}`;
    return {
      success: true,
      trackingNumber,
      estimatedPickup: new Date(Date.now() + 86400000).toISOString(),
      rawResponse: { mock: true, courier: this.courier, order: request.orderNumber },
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResponse> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      trackingNumber,
      status: "IN_TRANSIT",
      events: [
        {
          status: "PICKED_UP",
          description: "Paket telah diambil oleh kurir",
          location: "Jakarta Pusat",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          status: "IN_TRANSIT",
          description: "Paket sedang dalam perjalanan",
          location: "Hub Jakarta",
          timestamp: new Date(Date.now() - 43200000),
        },
      ],
    };
  }
}
