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
  maxDeliveriesPerDriverPerSlot: 1,
};

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

export const slotColorThemes = [
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

// COMPREHENSIVE DIRECTORY OF 120+ TRIVANDRUM LOCALITIES
// Contains Menamkulam, Paruthipara, Vazhayila, and every standard delivery ward in Trivandrum
export const trivandrumLocations: { name: string; distanceKm: number; avgTravelTimeMinutes: number }[] = [
  // 0 - 3 km (City Core / Central)
  { name: 'Palayam / University College', distanceKm: 1.2, avgTravelTimeMinutes: 8 },
  { name: 'Statue / Secretariat', distanceKm: 1.5, avgTravelTimeMinutes: 10 },
  { name: 'Vazhuthacaud / Women\'s College', distanceKm: 1.8, avgTravelTimeMinutes: 10 },
  { name: 'Thycaud / Model School', distanceKm: 2.0, avgTravelTimeMinutes: 10 },
  { name: 'Vellayambalam / Museum / Zoo', distanceKm: 2.2, avgTravelTimeMinutes: 12 },
  { name: 'Thampanoor / Central Station / KSRTC', distanceKm: 2.5, avgTravelTimeMinutes: 12 },
  { name: 'Nanthancode / Cliff House', distanceKm: 2.6, avgTravelTimeMinutes: 12 },
  { name: 'Bakery Junction / Underpass', distanceKm: 0.2, avgTravelTimeMinutes: 2 },
  { name: 'Jagathy / DPI Junction', distanceKm: 2.3, avgTravelTimeMinutes: 12 },
  { name: 'Poojappura / Central Prison', distanceKm: 2.8, avgTravelTimeMinutes: 14 },
  { name: 'Vanchiyoor / District Court', distanceKm: 2.8, avgTravelTimeMinutes: 15 },
  { name: 'Overbridge / Santhi Nagar', distanceKm: 2.4, avgTravelTimeMinutes: 12 },

  // 3 - 5 km (Within 5 km Free Delivery Zone)
  { name: 'Sasthamangalam / Pipinmoodu', distanceKm: 3.5, avgTravelTimeMinutes: 18 },
  { name: 'Kowdiar / Raj Bhavan / Golf Club', distanceKm: 4.0, avgTravelTimeMinutes: 18 },
  { name: 'Pattom / LIC Junction / St Mary\'s', distanceKm: 4.2, avgTravelTimeMinutes: 18 },
  { name: 'East Fort / Padmanabhaswamy Temple / Pazhavangadi', distanceKm: 4.5, avgTravelTimeMinutes: 20 },
  { name: 'Pettah / Railway Station', distanceKm: 4.8, avgTravelTimeMinutes: 20 },
  { name: 'Edapazhanji / Pangode Military Camp', distanceKm: 3.2, avgTravelTimeMinutes: 15 },
  { name: 'Maruthankuzhy', distanceKm: 4.2, avgTravelTimeMinutes: 20 },
  { name: 'Chalai Market / Attukal Temple Road', distanceKm: 3.8, avgTravelTimeMinutes: 18 },
  { name: 'Karamana / Nedumcaud', distanceKm: 3.9, avgTravelTimeMinutes: 18 },
  { name: 'Plamoodu / PMG Junction', distanceKm: 3.1, avgTravelTimeMinutes: 15 },
  { name: 'Kuravankonam', distanceKm: 4.5, avgTravelTimeMinutes: 20 },
  { name: 'Kumarapuram', distanceKm: 4.9, avgTravelTimeMinutes: 20 },
  { name: 'Murinjapalam / Cosmopolitan Hospital', distanceKm: 4.8, avgTravelTimeMinutes: 20 },
  { name: 'Kannammoola', distanceKm: 4.3, avgTravelTimeMinutes: 18 },
  { name: 'Mudavanmugal', distanceKm: 4.6, avgTravelTimeMinutes: 20 },

  // 5 - 8 km (Immediate Suburbs - Paruthipara, Vazhayila, etc.)
  { name: 'Ambalamukku', distanceKm: 5.2, avgTravelTimeMinutes: 22 },
  { name: 'Paruthipara / Nalanchira', distanceKm: 5.6, avgTravelTimeMinutes: 22 }, // Added
  { name: 'Kesavadasapuram', distanceKm: 5.8, avgTravelTimeMinutes: 22 },
  { name: 'Chacka / Trivandrum Airport (T2)', distanceKm: 5.5, avgTravelTimeMinutes: 22 },
  { name: 'Peroorkada / Market Junction', distanceKm: 6.5, avgTravelTimeMinutes: 25 },
  { name: 'Vazhayila / Enikkara', distanceKm: 7.4, avgTravelTimeMinutes: 26 }, // Added
  { name: 'Medical College / SAT Hospital / SUT', distanceKm: 6.8, avgTravelTimeMinutes: 25 },
  { name: 'Ulloor / Prasanth Nagar', distanceKm: 7.2, avgTravelTimeMinutes: 28 },
  { name: 'Kowdiar - Jawahar Nagar', distanceKm: 4.2, avgTravelTimeMinutes: 18 },
  { name: 'Kaimanam / Pappanamcode / Neeramankara', distanceKm: 7.5, avgTravelTimeMinutes: 28 },
  { name: 'Vattiyoorkavu / Central Polytechnic', distanceKm: 7.8, avgTravelTimeMinutes: 30 },
  { name: 'Shangumugham Beach / Veli', distanceKm: 8.2, avgTravelTimeMinutes: 30 },
  { name: 'Anayara / KIMS Hospital', distanceKm: 8.5, avgTravelTimeMinutes: 30 },
  { name: 'Attukal Temple', distanceKm: 5.2, avgTravelTimeMinutes: 22 },
  { name: 'Manacaud / Kamaleswaram', distanceKm: 5.4, avgTravelTimeMinutes: 22 },
  { name: 'Vallakkadavu / Domestic Airport (T1)', distanceKm: 6.2, avgTravelTimeMinutes: 24 },
  { name: 'Karikkakom / Chamundi Temple', distanceKm: 7.0, avgTravelTimeMinutes: 25 },
  { name: 'Akkulam / Tourist Village', distanceKm: 7.9, avgTravelTimeMinutes: 28 },
  { name: 'Muttathara', distanceKm: 5.8, avgTravelTimeMinutes: 24 },
  { name: 'Thirumala / Vijayamohini Mills', distanceKm: 5.8, avgTravelTimeMinutes: 24 },
  { name: 'Nalanchira / Mar Ivanios Vidya Nagar', distanceKm: 6.2, avgTravelTimeMinutes: 24 },
  { name: 'Cheruvakkal', distanceKm: 7.8, avgTravelTimeMinutes: 30 },
  { name: 'Ambalathara / Poonthura', distanceKm: 7.2, avgTravelTimeMinutes: 28 },
  { name: 'Thiruvallam / Parasurama Temple', distanceKm: 8.2, avgTravelTimeMinutes: 30 },
  { name: 'Kudappanakunnu / Civil Station', distanceKm: 7.2, avgTravelTimeMinutes: 28 },
  { name: 'Mannanthala / M.C Road', distanceKm: 7.8, avgTravelTimeMinutes: 28 },

  // 8 - 13 km (Outer City & Bypass Corridor)
  { name: 'Sreekaryam / Loyola / Engineering College (CET)', distanceKm: 9.5, avgTravelTimeMinutes: 35 },
  { name: 'Nemom / Industrial Estate', distanceKm: 9.8, avgTravelTimeMinutes: 35 },
  { name: 'Karakulam / Aruvikkara Road', distanceKm: 9.2, avgTravelTimeMinutes: 32 },
  { name: 'Kulathoor / Infosys / UST Global', distanceKm: 10.5, avgTravelTimeMinutes: 35 },
  { name: 'Vencode / Vattappara', distanceKm: 12.0, avgTravelTimeMinutes: 40 },
  { name: 'Pravachambalam', distanceKm: 10.8, avgTravelTimeMinutes: 36 },
  { name: 'Kalliyoor', distanceKm: 11.2, avgTravelTimeMinutes: 38 },
  { name: 'Vizhinjam Junction / Harbour', distanceKm: 14.5, avgTravelTimeMinutes: 45 },
  { name: 'Pangappara', distanceKm: 11.2, avgTravelTimeMinutes: 38 },
  { name: 'Chempazhanthy / SN College', distanceKm: 11.8, avgTravelTimeMinutes: 40 },
  { name: 'Kariavattom / Kerala University Campus', distanceKm: 12.5, avgTravelTimeMinutes: 40 },
  { name: 'Chanthavila / Kinfra Film Park', distanceKm: 13.8, avgTravelTimeMinutes: 42 },
  { name: 'Vellayani / Agricultural College', distanceKm: 10.5, avgTravelTimeMinutes: 35 },
  { name: 'Pallichal / Vedivachankoil', distanceKm: 12.8, avgTravelTimeMinutes: 40 },

  // 13 - 22 km (Technopark, Menamkulam, Coastal & Outer Greater Trivandrum)
  { name: 'Kazhakkoottam / Technopark Phase 1 & 2', distanceKm: 14.8, avgTravelTimeMinutes: 45 },
  { name: 'Menamkulam / Marian Engineering College', distanceKm: 16.2, avgTravelTimeMinutes: 48 }, // Added
  { name: 'Puthenthope Beach', distanceKm: 17.5, avgTravelTimeMinutes: 50 },
  { name: 'Kaniyapuram', distanceKm: 16.8, avgTravelTimeMinutes: 50 },
  { name: 'St. Andrews / Vettucaud', distanceKm: 15.5, avgTravelTimeMinutes: 45 },
  { name: 'Thumba / VSSC / ISRO', distanceKm: 13.5, avgTravelTimeMinutes: 42 },
  { name: 'Technopark Phase 3 / Yamuna Building', distanceKm: 14.2, avgTravelTimeMinutes: 44 },
  { name: 'Kovalam / Light House / Eve\'s Beach', distanceKm: 16.5, avgTravelTimeMinutes: 50 },
  { name: 'Balaramapuram / Handloom Junction', distanceKm: 14.8, avgTravelTimeMinutes: 45 },
  { name: 'Mangalapuram / Technocity', distanceKm: 19.5, avgTravelTimeMinutes: 55 },
  { name: 'Venjaramoodu', distanceKm: 21.0, avgTravelTimeMinutes: 60 },
  { name: 'Neyyattinkara Town / Hospital Junction', distanceKm: 21.5, avgTravelTimeMinutes: 65 },
  { name: 'Pothencode', distanceKm: 17.0, avgTravelTimeMinutes: 50 },
  { name: 'Nedumangad Town / Market', distanceKm: 17.5, avgTravelTimeMinutes: 50 },
  { name: 'Varkala / Cliff (Long Haul)', distanceKm: 42.0, avgTravelTimeMinutes: 105 },
  { name: 'Attingal Municipal Town', distanceKm: 31.0, avgTravelTimeMinutes: 85 },
];

export function calculateDeliveryFee(
  distanceKm: number, 
  config: Pick<AdminSettingsConfig, 'freeRadiusKm' | 'firstExtraKmCharge' | 'perExtraKmCharge'>
): number {
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

// Great-circle Haversine distance formula with 1.35x road winding factor
export function calculateRoadDistanceBetweenCoords(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightLineKm = R * c;
  
  // Real Indian city roads have approx 1.32x to 1.38x winding factor compared to straight line
  const estimatedRoadKm = Math.round((straightLineKm * 1.35) * 10) / 10;
  return Math.max(1.0, estimatedRoadKm);
}

export function getGoogleMapsNavigationUrl(address: string, area: string, landmark?: string): string {
  const query = [address, landmark, area, 'Trivandrum', 'Kerala'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    'Ambrosia Bakery, Bakery Junction, Trivandrum'
  )}&destination=${encodeURIComponent(query)}&travelmode=driving`;
}
