export type CourierCode = "JNE" | "JNT" | "SICEPAT" | "GOSEND";

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ShippingItem {
  name: string;
  weight: number; // grams
  quantity: number;
  value: number;  // IDR
}

export interface ShippingRateRequest {
  origin: ShippingAddress;
  destination: ShippingAddress;
  items: ShippingItem[];
  totalWeight: number; // grams
}

export interface ShippingService {
  code: string;
  name: string;
  description: string;
  estimatedDays: number;
  price: number; // IDR
}

export interface ShippingRateResponse {
  courier: CourierCode;
  services: ShippingService[];
  error?: string;
}

export interface BookShipmentRequest {
  origin: ShippingAddress;
  destination: ShippingAddress;
  items: ShippingItem[];
  serviceCode: string;
  orderNumber: string;
  notes?: string;
}

export interface BookShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  estimatedPickup?: string;
  label?: string; // base64 PDF
  rawResponse?: unknown;
  error?: string;
}

export interface TrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface TrackingResponse {
  trackingNumber: string;
  status: string;
  events: TrackingEvent[];
  error?: string;
}

export interface CourierAdapter {
  courier: CourierCode;
  getRates(request: ShippingRateRequest): Promise<ShippingRateResponse>;
  bookShipment(request: BookShipmentRequest): Promise<BookShipmentResponse>;
  trackShipment(trackingNumber: string): Promise<TrackingResponse>;
}
