/**
 * SHIPPING ADAPTER LAYER
 *
 * Current status: MOCKED — all couriers return simulated data.
 *
 * To connect a real courier API:
 * 1. Create a new file: src/lib/shipping/adapters/<courier>.ts
 * 2. Implement the CourierAdapter interface from ./types
 * 3. Replace MockCourierAdapter in the getAdapter() function below
 * 4. Add the API key to .env.local (see README)
 *
 * Courier integration docs (to be linked when API access obtained):
 * - JNE: https://apidoc.jne.co.id
 * - J&T: https://developer.jet.co.id
 * - SiCepat: https://developer.sicepat.com
 * - GoSend: https://developer.gojek.com/products/logistics
 */

import { MockCourierAdapter } from "./mock-adapter";
import type { CourierAdapter, CourierCode, ShippingRateRequest, ShippingRateResponse } from "./types";

export * from "./types";

const ENABLED_COURIERS: CourierCode[] = ["JNE", "JNT", "SICEPAT", "GOSEND"];

function getAdapter(courier: CourierCode): CourierAdapter {
  // TODO: replace with real adapters as API credentials are obtained
  // Example: if (courier === "JNE") return new JNEAdapter(process.env.JNE_API_KEY!);
  return new MockCourierAdapter(courier);
}

export async function getAllRates(request: ShippingRateRequest): Promise<ShippingRateResponse[]> {
  const results = await Promise.allSettled(
    ENABLED_COURIERS.map((courier) => getAdapter(courier).getRates(request))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<ShippingRateResponse> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function getRates(courier: CourierCode, request: ShippingRateRequest) {
  return getAdapter(courier).getRates(request);
}

export async function bookShipment(courier: CourierCode, request: Parameters<CourierAdapter["bookShipment"]>[0]) {
  return getAdapter(courier).bookShipment(request);
}

export async function trackShipment(courier: CourierCode, trackingNumber: string) {
  return getAdapter(courier).trackShipment(trackingNumber);
}
