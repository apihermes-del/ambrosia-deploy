'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Calculator, 
  Clock, 
  IndianRupee, 
  Settings, 
  Sliders, 
  CheckCircle2, 
  Info,
  Car
} from 'lucide-react';
import { trivandrumLocations, calculateDeliveryFee, estimateRoundTripMinutes } from '@/lib/deliveryPricing';

export const DeliveryCalendarPricingView: React.FC = () => {
  const { orders, pricingConfig, updatePricingConfig, currentUser } = useApp();
  
  // Date filter for calendar slot inspection
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Delivery Calculator State
  const [inputKm, setInputKm] = useState<number>(6.5);
  const [selectedPresetArea, setSelectedPresetArea] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');

  // Settings State (Admin accessible)
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [freeRadiusInput, setFreeRadiusInput] = useState(pricingConfig.freeRadiusKm);
  const [firstExtraInput, setFirstExtraInput] = useState(pricingConfig.firstExtraKmCharge);
  const [perExtraInput, setPerExtraInput] = useState(pricingConfig.perExtraKmCharge);
  const [settingsSavedBanner, setSettingsSavedBanner] = useState(false);

  // Time slots definition for checking slot capacity & bookings
  const timeSlots = [
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '20:00 - 22:00',
  ];

  // Orders on selected date
  const dateOrders = orders.filter(o => o.delivery_date === selectedDate && o.status !== 'cancelled');

  // Handle Preset Area selection
  const handleSelectArea = (areaName: string) => {
    setSelectedPresetArea(areaName);
    const loc = trivandrumLocations.find(l => l.name === areaName);
    if (loc) {
      setInputKm(loc.distanceKm);
      setCustomAddress(`${areaName}, Trivandrum`);
    }
  };

  const calculatedFee = calculateDeliveryFee(inputKm, pricingConfig);
  const roundTripTime = estimateRoundTripMinutes(inputKm);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      ...pricingConfig,
      freeRadiusKm: Number(freeRadiusInput),
      firstExtraKmCharge: Number(firstExtraInput),
      perExtraKmCharge: Number(perExtraInput),
    });
    setIsEditingSettings(false);
    setSettingsSavedBanner(true);
    setTimeout(() => setSettingsSavedBanner(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Delivery Slot Calendar & Distance Pricing
            <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Smart Rate Engine
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Check live slot occupancy before booking, calculate accurate distance delivery charges from Bakery Junction, and estimate round trip transit times.
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

      {settingsSavedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Delivery pricing formula successfully updated!
        </div>
      )}

      {/* Grid: Calendar View on Left + Delivery Distance Calculator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ========================================================================= */}
        {/* LEFT: SLOT CALENDAR & OCCUPANCY (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Scheduled Deliveries for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slot occupancy overview to prevent kitchen overload and driver bottlenecks.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
                {dateOrders.length} Bookings
              </span>
            </div>

            {/* Slots Matrix */}
            <div className="space-y-4">
              {timeSlots.map(slot => {
                const slotOrders = dateOrders.filter(o => o.delivery_time_slot === slot);
                const isHeavy = slotOrders.length >= 3;
                const isModerate = slotOrders.length === 2;

                return (
                  <div 
                    key={slot} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      isHeavy 
                        ? 'border-rose-200 bg-rose-50/40' 
                        : isModerate 
                        ? 'border-amber-200 bg-amber-50/30' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{slot}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHeavy ? 'bg-rose-100 text-rose-800' :
                          isModerate ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {slotOrders.length} {slotOrders.length === 1 ? 'Order' : 'Orders'} {isHeavy ? '⚠️ Busy Slot' : isModerate ? '⚡ Moderate' : '✓ Available'}
                        </span>
                      </div>

                      <span className="text-[11px] text-gray-400 font-medium">
                        Capacity: 4 orders/slot
                      </span>
                    </div>

                    {/* Bookings inside slot */}
                    {slotOrders.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
                        {slotOrders.map(o => (
                          <div key={o.id} className="text-xs flex items-center justify-between bg-white/80 p-2 rounded-lg border border-gray-200/70">
                            <div>
                              <span className="font-mono font-bold text-amber-950">{o.tally_so_number}</span>
                              <span className="text-gray-800 font-semibold ml-2">{o.customer_name}</span>
                              <span className="text-gray-500 text-[11px] ml-2">({o.delivery_area})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {o.assignment_type === 'four_wheeler' && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                  🚙 4-Wheeler
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-gray-700">₹{o.total_amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: TRIVANDRUM DELIVERY DISTANCE & PRICING CALCULATOR (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                Delivery Distance & Rate Engine
              </h2>
              <button
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
                title="Configure Pricing Formula"
              >
                <Settings className="w-3.5 h-3.5" />
                Formula Settings
              </button>
            </div>

            {/* Bakery Hub Reference */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1 mb-4">
              <div className="flex items-center gap-1 font-bold">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                Origin: Ambrosia Bakery Junction, Trivandrum
              </div>
              <div className="text-[11px] text-gray-600">
                Opposite Bharath Petroleum, Krishna Towers
              </div>
            </div>

            {/* Quick Area Preset Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">
                Select Destination Suburb (Trivandrum City):
              </label>
              <select
                value={selectedPresetArea}
                onChange={e => handleSelectArea(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">-- Or Pick Pre-mapped Location --</option>
                {trivandrumLocations.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} (~{loc.distanceKm} km from bakery)
                  </option>
                ))}
              </select>

              {/* Exact Distance Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Or Input One-Way Road Distance (Kilometers):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={inputKm}
                    onChange={e => {
                      setInputKm(Number(e.target.value));
                      setSelectedPresetArea('');
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-semibold">km</span>
                </div>
              </div>

              {/* Calculated Pricing Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Calculated Delivery Charge:</span>
                  <span className={`text-2xl font-black ${calculatedFee === 0 ? 'text-emerald-700' : 'text-amber-950'}`}>
                    {calculatedFee === 0 ? 'FREE DELIVERY' : `₹${calculatedFee}`}
                  </span>
                </div>

                <div className="text-[11px] text-gray-600 space-y-1 pt-2 border-t border-amber-200/60">
                  <div className="flex items-center justify-between">
                    <span>Free Delivery Allowance:</span>
                    <span className="font-semibold">{pricingConfig.freeRadiusKm} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chargable Distance:</span>
                    <span className="font-semibold">
                      {inputKm <= pricingConfig.freeRadiusKm ? '0 km' : `${(inputKm - pricingConfig.freeRadiusKm).toFixed(1)} km`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-900 font-bold pt-1">
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> Estimated To-and-Fro Transit:
                    </span>
                    <span>~{roundTripTime} minutes</span>
                  </div>
                </div>

                {inputKm > 10 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Long-distance trip (&gt;10km). Recommend booking a wider 2-hour slot to allow safe return travel.
                    </span>
                  </div>
                )}
              </div>

              {/* Google Maps External Verification */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    'Ambrosia Bakery, Bakery Junction, Trivandrum'
                  )}&destination=${encodeURIComponent((selectedPresetArea || `${inputKm}km from Bakery Junction`) + ', Trivandrum')}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 text-xs font-semibold text-center text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Verify Exact Route on Google Maps
                </a>
              </div>
            </div>

            {/* Formula Settings Panel (Toggled by Admin) */}
            {isEditingSettings && (
              <form onSubmit={handleSaveSettings} className="mt-6 pt-5 border-t border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-700" />
                  Admin Pricing Formula Configuration
                </h4>

                <div>
                  <label className="block text-[11px] text-gray-600 font-semibold mb-1">
                    Free Delivery Radius (km):
                  </label>
                  <input
                    type="number"
                    value={freeRadiusInput}
                    onChange={e => setFreeRadiusInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 font-semibold mb-1">
                    First Extra Km Charge (₹):
                  </label>
                  <input
                    type="number"
                    value={firstExtraInput}
                    onChange={e => setFirstExtraInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 font-semibold mb-1">
                    Subsequent Each Extra Km Charge (₹):
                  </label>
                  <input
                    type="number"
                    value={perExtraInput}
                    onChange={e => setPerExtraInput(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSettings(false)}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Save Formula
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
