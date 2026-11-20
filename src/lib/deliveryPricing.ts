import { AdminSettingsConfig } from '@/types';

export const defaultSettingsConfig: AdminSettingsConfig = {
  freeRadiusKm: 5,
  firstExtraKmCharge: 75,
  perExtraKmCharge: 25,
  bakeryAddress: 'Ambrosia Bakery, Krishna Towers, Opp. Bharath Petroleum, Bakery Junction, Trivandrum',
  bakeryCoordinates: {
    lat: 8.4998,
    lng: 76.9535,
  },
  openingTime: '09:00',
  closingTime: '21:00',
  slotDurationHours: 2,
  totalDeliveryEmployees: 4,
  maxDeliveriesPerDriverPerSlot: 1, // each rider can reliably handle 1 dedicated cake delivery in a slot
};

// Generates time slots based on opening time, closing time and slot duration
export function generateTimeSlots(openingTime: string, closingTime: string, durationHours: number): string[] {
  const [startHour] = openingTime.split(':').map(Number);
  const [endHour] = closingTime.split(':').map(Number);

  const slots: string[] = [];
  let current = startHour || 9;
  const max = endHour || 21;

  while (current + durationHours <= max) {
    const fromStr = `${String(current).padStart(2, '0')}:00`;
    const toStr = `${String(current + durationHours).padStart(2, '0')}:00`;
    slots.push(`${fromStr} - ${toStr}`);
    current += durationHours;
  }

  return slots;
}

// 6 distinctly styled color themes for time slots so customer care can distinguish them instantly
export const slotColorThemes: {
  border: string;
  bg: string;
  badge: string;
  accent: string;
  header: string;
}[] = [
  {
    border: 'border-amber-300',
    bg: 'bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    accent: 'text-amber-800',
    header: 'bg-amber-100/70 text-amber-950',
  },
  {
    border: 'border-blue-300',
    bg: 'bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-900 border-blue-300',
    accent: 'text-blue-800',
    header: 'bg-blue-100/70 text-blue-950',
  },
  {
    border: 'border-emerald-300',
    bg: 'bg-emerald-50/50',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accent: 'text-emerald-800',
    header: 'bg-emerald-100/70 text-emerald-950',
  },
  {
    border: 'border-purple-300',
    bg: 'bg-purple-50/50',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    accent: 'text-purple-800',
    header: 'bg-purple-100/70 text-purple-950',
  },
  {
    border: 'border-rose-300',
    bg: 'bg-rose-50/50',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    accent: 'text-rose-800',
    header: 'bg-rose-100/70 text-rose-950',
  },
  {
    border: 'border-teal-300',
    bg: 'bg-teal-50/50',
    badge: 'bg-teal-100 text-teal-900 border-teal-300',
    accent: 'text-teal-800',
    header: 'bg-teal-100/70 text-teal-950',
  },
];

// Curated list of 50+ prominent Trivandrum localities, suburbs, hospitals, and landmarks with real road distance from Bakery Junction
export const trivandrumLocations: { name: string; distanceKm: number; avgTravelTimeMinutes: number }[] = [
  { name: 'Palayam / University College', distanceKm: 1.2, avgTravelTimeMinutes: 8 },
  { name: 'Statue / Secretariate', distanceKm: 1.5, avgTravelTimeMinutes: 10 },
  { name: 'Vazhuthacaud / Women\'s College', distanceKm: 1.8, avgTravelTimeMinutes: 10 },
  { name: 'Thycaud / Model School', distanceKm: 2.0, avgTravelTimeMinutes: 10 },
  { name: 'Vellayambalam / Museum', distanceKm: 2.2, avgTravelTimeMinutes: 12 },
  { name: 'Thampanoor / Central Station', distanceKm: 2.5, avgTravelTimeMinutes: 12 },
  { name: 'Sasthamangalam', distanceKm: 3.5, avgTravelTimeMinutes: 18 },
  { name: 'Kowdiar / Raj Bhavan', distanceKm: 4.0, avgTravelTimeMinutes: 20 },
  { name: 'Pattom / LIC Junction', distanceKm: 4.2, avgTravelTimeMinutes: 18 },
  { name: 'East Fort / Padmanabhaswamy Temple', distanceKm: 4.5, avgTravelTimeMinutes: 20 },
  { name: 'Pettah / Railway Station', distanceKm: 4.8, avgTravelTimeMinutes: 20 },
  { name: 'Ambalamukku', distanceKm: 5.2, avgTravelTimeMinutes: 22 },
  { name: 'Chacka / Trivandrum Airport (T2)', distanceKm: 5.5, avgTravelTimeMinutes: 22 },
  { name: 'Kesavadasapuram', distanceKm: 5.8, avgTravelTimeMinutes: 22 },
  { name: 'Peroorkada', distanceKm: 6.5, avgTravelTimeMinutes: 25 },
  { name: 'Medical College / SAT Hospital', distanceKm: 6.8, avgTravelTimeMinutes: 25 },
  { name: 'Ulloor / Prasanth Nagar', distanceKm: 7.2, avgTravelTimeMinutes: 28 },
  { name: 'Kaimanam / Pappanamcode', distanceKm: 7.5, avgTravelTimeMinutes: 28 },
  { name: 'Vattiyoorkavu', distanceKm: 7.8, avgTravelTimeMinutes: 30 },
  { name: 'Shangumugham Beach', distanceKm: 8.2, avgTravelTimeMinutes: 30 },
  { name: 'Anayara / KIMS Hospital', distanceKm: 8.5, avgTravelTimeMinutes: 30 },
  { name: 'Sreekaryam / Loyola', distanceKm: 9.5, avgTravelTimeMinutes: 35 },
  { name: 'Nemom / Industrial Estate', distanceKm: 9.8, avgTravelTimeMinutes: 35 },
  { name: 'Mannanthala', distanceKm: 10.2, avgTravelTimeMinutes: 38 },
  { name: 'Venjaramoodu Road / Vembayam', distanceKm: 14.5, avgTravelTimeMinutes: 45 },
  { name: 'Kazhakkoottam / Technopark Phase 1', distanceKm: 14.8, avgTravelTimeMinutes: 45 },
  { name: 'Technopark Phase 3 / Kariavattom', distanceKm: 15.2, avgTravelTimeMinutes: 48 },
  { name: 'Kovalam / Lighthouse Beach', distanceKm: 16.5, avgTravelTimeMinutes: 50 },
  { name: 'Vizhinjam International Port', distanceKm: 18.0, avgTravelTimeMinutes: 55 },
  { name: 'Neyyattinkara Town', distanceKm: 21.0, avgTravelTimeMinutes: 65 },
  { name: 'Attingal Municipal Town', distanceKm: 31.0, avgTravelTimeMinutes: 85 },
];

export function calculateDeliveryFee(distanceKm: number, config: Pick<AdminSettingsConfig, 'freeRadiusKm' | 'firstExtraKmCharge' | 'perExtraKmCharge'>): number {
  if (distanceKm <= config.freeRadiusKm) {
    return 0;
  }
  const excessKm = distanceKm - config.freeRadiusKm;
  if (excessKm <= 1) {
    return config.firstExtraKmCharge;
  }
  const additionalKm = Math.ceil(excessKm - 1);
  return config.firstExtraKmCharge + (additionalKm * config.perExtraKmCharge);
}

export function estimateRoundTripMinutes(oneWayKm: number): number {
  const roundTripKm = oneWayKm * 2;
  const drivingMinutes = Math.round((roundTripKm / 22) * 60);
  return drivingMinutes + 12;
}

export function getGoogleMapsNavigationUrl(address: string, area: string, landmark?: string): string {
  const query = [address, landmark, area, 'Trivandrum', 'Kerala'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    'Ambrosia Bakery, Bakery Junction, Trivandrum'
  )}&destination=${encodeURIComponent(query)}&travelmode=driving`;
}
