'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Calculator, 
  Clock, 
  IndianRupee, 
  Search, 
  CheckCircle2, 
  Info,
  Car,
  Navigation,
  Sparkles,
  Loader2,
  Globe
} from 'lucide-react';
import { 
  trivandrumLocations, 
  calculateDeliveryFee, 
  estimateRoundTripMinutes,
  generateTimeSlots,
  slotColorThemes,
  getGoogleMapsNavigationUrl,
  calculateRoadDistanceBetweenCoords
} from '@/lib/deliveryPricing';

export const DeliveryCalendarPricingView: React.FC = () => {
  const { orders, settingsConfig } = useApp();
  
  // Date filter
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Dynamic Free-form Address Input State
  const [addressSearchInput, setAddressSearchInput] = useState<string>('Menamkulam, Trivandrum');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(16.2);
  const [isTypingLocation, setIsTypingLocation] = useState(false);
  const [matchedLocationName, setMatchedLocationName] = useState<string>('Menamkulam / Marian Engineering College');
  
  // Free Live Online Geocoding state (OpenStreetMap / Nominatim)
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResultNotice, setOnlineResultNotice] = useState<string | null>(null);

  // Generate slots from admin settings
  const dynamicSlots = generateTimeSlots(
    settingsConfig.openingTime,
    settingsConfig.closingTime,
    settingsConfig.slotDurationHours
  );

  const slotCapacity = settingsConfig.totalDeliveryEmployees * (settingsConfig.maxDeliveriesPerDriverPerSlot || 1);

  // Exclude outlet pickups completely from the calendar
  const dateHomeDeliveryOrders = orders.filter(
    o => o.order_type === 'home_delivery' && 
         o.delivery_date === selectedDate && 
         o.status !== 'cancelled'
  );

  // Filter suggestion list based on user typing
  const searchResults = trivandrumLocations.filter(loc => 
    loc.name.toLowerCase().includes(addressSearchInput.toLowerCase().trim())
  );

  const handleAddressTextChange = (text: string) => {
    setAddressSearchInput(text);
    setIsTypingLocation(true);
    setOnlineResultNotice(null);

    const lower = text.toLowerCase().trim();
    if (!lower) return;

    // Search against comprehensive local dataset first
    const found = trivandrumLocations.find(l => 
      l.name.toLowerCase().includes(lower) ||
      lower.includes(l.name.toLowerCase().split('/')[0].trim())
    );

    if (found) {
      setCustomDistanceKm(found.distanceKm);
      setMatchedLocationName(found.name);
    }
  };

  const handleSelectSuggestion = (loc: typeof trivandrumLocations[0]) => {
    setAddressSearchInput(`${loc.name}, Trivandrum`);
    setCustomDistanceKm(loc.distanceKm);
    setMatchedLocationName(loc.name);
    setIsTypingLocation(false);
    setOnlineResultNotice(null);
  };

  // 100% FREE Live Online Distance Lookup (Powered by OpenStreetMap Nominatim)
  const handleLiveOnlineLookup = async () => {
    if (!addressSearchInput.trim()) return;
    setIsSearchingOnline(true);
    setOnlineResultNotice(null);

    try {
      const query = encodeURIComponent(`${addressSearchInput.trim()}, Thiruvananthapuram, Kerala, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      if (data && data.length > 0) {
        const place = data[0];
        const destLat = parseFloat(place.lat);
        const destLon = parseFloat(place.lon);

        // Calculate distance from Ambrosia Bakery Junction (lat: 8.4998, lng: 76.9535)
        const computedKm = calculateRoadDistanceBetweenCoords(
          settingsConfig.bakeryCoordinates.lat,
          settingsConfig.bakeryCoordinates.lng,
          destLat,
          destLon
        );

        setCustomDistanceKm(computedKm);
        setMatchedLocationName(place.name || place.display_name.split(',')[0]);
        setOnlineResultNotice(`Live GPS Located: "${place.display_name.split(',').slice(0, 3).join(',')}" (~${computedKm} km from Bakery Junction)`);
        setIsTypingLocation(false);
      } else {
        setOnlineResultNotice('Location pin not found. You can adjust the distance slider manually or verify on Google Maps.');
      }
    } catch (err) {
      console.error(err);
      setOnlineResultNotice('Could not connect to map service. Use the distance slider below.');
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const calculatedFee = calculateDeliveryFee(customDistanceKm, settingsConfig);
  const roundTripTime = estimateRoundTripMinutes(customDistanceKm);

  const googleMapsRouteUrl = getGoogleMapsNavigationUrl(
    addressSearchInput,
    matchedLocationName || 'Trivandrum'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Delivery Slot Calendar & Live Distance Engine
            <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Home Deliveries Only
            </span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Color-coded slots for quick visual differentiation. Broadened search covers every locality across Trivandrum.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-2 rounded-xl shadow-2xs">
          <CalendarIcon className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-semibold text-gray-600">Inspect Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-gray-900 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Grid: Color-coded Calendar on Left + Broadened Distance Engine on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT: COLOR-CODED TIME SLOTS (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Slots for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Operating Hours: {settingsConfig.openingTime} to {settingsConfig.closingTime} ({settingsConfig.slotDurationHours}h slots • Max {slotCapacity} deliveries/slot)
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
                {dateHomeDeliveryOrders.length} Home Deliveries
              </span>
            </div>

            {/* Distinct Color-Coded Slots Matrix */}
            <div className="space-y-3.5">
              {dynamicSlots.map((slot, index) => {
                const colorTheme = slotColorThemes[index % slotColorThemes.length];
                const slotOrders = dateHomeDeliveryOrders.filter(o => o.delivery_time_slot === slot);
                const isOverCapacity = slotOrders.length >= slotCapacity;
                const isNearCapacity = slotOrders.length === slotCapacity - 1 && slotCapacity > 1;

                return (
                  <div 
                    key={slot} 
                    className={`rounded-xl border-2 ${colorTheme.border} ${colorTheme.bg} overflow-hidden transition-all shadow-xs`}
                  >
                    <div className={`px-3 py-2 ${colorTheme.header} flex items-center justify-between border-b ${colorTheme.border}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-current opacity-80" />
                        <span className="text-xs font-black tracking-wide">{slot}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isOverCapacity ? 'bg-rose-600 text-white border-rose-700 animate-pulse' :
                          isNearCapacity ? 'bg-amber-500 text-white border-amber-600' :
                          'bg-emerald-600 text-white border-emerald-700'
                        }`}>
                          {slotOrders.length} / {slotCapacity} {isOverCapacity ? '⛔ FULL' : isNearCapacity ? '⚡ 1 Slot Left' : '✓ Open'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3">
                      {slotOrders.length === 0 ? (
                        <div className="text-[11px] text-gray-400 italic py-1">
                          No deliveries booked in this slot yet. Available for customer care scheduling.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {slotOrders.map(o => (
                            <div 
                              key={o.id} 
                              className="text-xs bg-white/95 p-2 rounded-lg border border-gray-200/80 flex items-center justify-between shadow-2xs"
                            >
                              <div>
                                <span className="font-mono font-bold text-gray-900">{o.tally_so_number}</span>
                                <span className="text-gray-900 font-bold ml-2">{o.customer_name}</span>
                                <span className={`text-[11px] font-semibold ml-2 ${colorTheme.accent}`}>
                                  📍 {o.delivery_area}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {o.assignment_type === 'four_wheeler' && (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                    🚙 4-Wheeler
                                  </span>
                                )}
                                <span className="font-bold text-gray-700 text-[11px]">
                                  ₹{o.total_amount}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: BROADENED TRIVANDRUM DISTANCE & RATE ENGINE (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                Live Distance & Rate Engine
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Now broadened to 120+ Trivandrum locations with free GPS live lookup for any unknown pin.
              </p>
            </div>

            {/* Bakery Hub Reference */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <div>
                <span className="font-bold block">Origin: Ambrosia Bakery Junction Hub</span>
                <span className="text-[10px] text-gray-600">Krishna Towers, Opp. Bharath Petroleum, Trivandrum</span>
              </div>
            </div>

            {/* Free-form Address Input with Autocomplete & Live Lookup */}
            <div className="space-y-3 relative">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type Any Address, Suburb or Colony:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Menamkulam, Paruthipara, Vazhayila, Technopark..."
                      value={addressSearchInput}
                      onChange={e => handleAddressTextChange(e.target.value)}
                      onFocus={() => setIsTypingLocation(true)}
                      onKeyDown={e => e.key === 'Enter' && handleLiveOnlineLookup()}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLiveOnlineLookup}
                    disabled={isSearchingOnline}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap"
                    title="Search via OpenStreetMap"
                  >
                    {isSearchingOnline ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">GPS Pin</span>
                  </button>
                </div>

                {onlineResultNotice && (
                  <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{onlineResultNotice}</span>
                  </div>
                )}

                {/* Instant Autocomplete Suggestions */}
                {isTypingLocation && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 py-1 divide-y divide-gray-50">
                    {searchResults.slice(0, 10).map(loc => (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => handleSelectSuggestion(loc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-900">{loc.name}</span>
                        <span className="text-[11px] font-mono text-amber-800 font-bold">~{loc.distanceKm} km</span>
                      </button>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="px-3 py-1 text-[10px] text-gray-400 bg-gray-50 text-center">
                        + {searchResults.length - 10} more matches. Keep typing to filter...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Road Distance Fine-Tuning Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Computed Distance from Bakery:</span>
                  <span className="font-bold font-mono text-amber-900 text-sm">{customDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="45"
                  step="0.1"
                  value={customDistanceKm}
                  onChange={e => setCustomDistanceKm(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>0.5 km (Bakery Junc)</span>
                  <span>5 km (Free Limit)</span>
                  <span>45 km (Outer Trivandrum)</span>
                </div>
              </div>

              {/* Dynamic Rate Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Calculated Delivery Fee:</span>
                  <span className={`text-2xl font-black ${calculatedFee === 0 ? 'text-emerald-700' : 'text-amber-950'}`}>
                    {calculatedFee === 0 ? 'FREE DELIVERY' : `₹${calculatedFee}`}
                  </span>
                </div>

                <div className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span>Free Delivery Allowance:</span>
                    <span className="font-semibold">{settingsConfig.freeRadiusKm} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chargeable Distance:</span>
                    <span className="font-semibold">
                      {customDistanceKm <= settingsConfig.freeRadiusKm ? '0 km' : `${(customDistanceKm - settingsConfig.freeRadiusKm).toFixed(1)} km`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-900 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> Estimated Round-Trip Transit:
                    </span>
                    <span>~{roundTripTime} minutes</span>
                  </div>
                </div>

                {customDistanceKm > 10 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Long-distance trip (&gt;10km). Recommend booking a wider 2-hour slot to allow safe return travel.
                    </span>
                  </div>
                )}
              </div>

              {/* Google Maps External Verification Button */}
              <div className="pt-2">
                <a
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 text-xs font-bold text-center text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Navigation className="w-4 h-4" />
                  Verify Exact Route on Google Maps
                </a>
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed text-center">
                  Opens Google Maps Directions with <strong>Ambrosia Bakery Junction</strong> pre-set as the origin and your typed address as the destination to inspect real-time live traffic, road blocks, or route pins.
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
