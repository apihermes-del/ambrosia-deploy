import { DeliveryPricingConfig } from '@/types';

// Default pricing config as requested:
// Free delivery radius: 5km.
// Post that, first km: ₹75.
// After that, each km: ₹25.
// Bakery: Krishna Towers, opposite Bharath petroleum, Bakery Junction, Trivandrum (approx lat: 8.4998, lng: 76.9535)
export const defaultPricingConfig: DeliveryPricingConfig = {
  freeRadiusKm: 5,
  firstExtraKmCharge: 75,
  perExtraKmCharge: 25,
  bakeryAddress: 'Ambrosia Bakery, Krishna Towers, Opp. Bharath Petroleum, Bakery Junction, Trivandrum',
  bakeryCoordinates: {
    lat: 8.4998,
    lng: 76.9535,
  },
};

// Known popular Trivandrum areas with distance estimate from Bakery Junction
export const trivandrumLocations: { name: string; distanceKm: number; avgTravelTimeMinutes: number }[] = [
  { name: 'Palayam / University', distanceKm: 1.2, avgTravelTimeMinutes: 10 },
  { name: 'Vazhuthacaud', distanceKm: 1.8, avgTravelTimeMinutes: 12 },
  { name: 'Statue / Secretariate', distanceKm: 2.1, avgTravelTimeMinutes: 12 },
  { name: 'Vellayambalam', distanceKm: 2.5, avgTravelTimeMinutes: 15 },
  { name: 'Sasthamangalam', distanceKm: 3.8, avgTravelTimeMinutes: 20 },
  { name: 'Kawdiar', distanceKm: 4.2, avgTravelTimeMinutes: 22 },
  { name: 'Pattom', distanceKm: 4.5, avgTravelTimeMinutes: 20 },
  { name: 'Ambalamukku', distanceKm: 5.5, avgTravelTimeMinutes: 25 },
  { name: 'Peroorkada', distanceKm: 6.8, avgTravelTimeMinutes: 30 },
  { name: 'Ulloor / Medical College', distanceKm: 7.2, avgTravelTimeMinutes: 30 },
  { name: 'Sreekaryam', distanceKm: 9.5, avgTravelTimeMinutes: 40 },
  { name: 'Kazhakkoottam / Technopark', distanceKm: 14.8, avgTravelTimeMinutes: 50 },
  { name: 'Kovalam', distanceKm: 16.5, avgTravelTimeMinutes: 55 },
  { name: 'Neyyattinkara', distanceKm: 21.0, avgTravelTimeMinutes: 70 },
  { name: 'Attingal', distanceKm: 31.0, avgTravelTimeMinutes: 90 },
];

export function calculateDeliveryFee(distanceKm: number, config: DeliveryPricingConfig): number {
  if (distanceKm <= config.freeRadiusKm) {
    return 0;
  }
  const excessKm = distanceKm - config.freeRadiusKm;
  if (excessKm <= 1) {
    return config.firstExtraKmCharge;
  }
  // 1st extra km is firstExtraKmCharge, rest is perExtraKmCharge
  const additionalKm = Math.ceil(excessKm - 1);
  return config.firstExtraKmCharge + (additionalKm * config.perExtraKmCharge);
}

// Estimate to-and-fro time in city traffic (approx 20 km/hr average speed in city + 10 mins buffer)
export function estimateRoundTripMinutes(oneWayKm: number): number {
  const roundTripKm = oneWayKm * 2;
  const drivingMinutes = Math.round((roundTripKm / 22) * 60);
  return drivingMinutes + 12; // 12 mins buffer for delivery handover & gate security
}

// Helper to construct exact Google Maps search URL with bakery origin or destination
export function getGoogleMapsNavigationUrl(address: string, area: string, landmark?: string): string {
  const query = [address, landmark, area, 'Trivandrum', 'Kerala'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    'Ambrosia Bakery, Bakery Junction, Trivandrum'
  )}&destination=${encodeURIComponent(query)}&travelmode=driving`;
}
