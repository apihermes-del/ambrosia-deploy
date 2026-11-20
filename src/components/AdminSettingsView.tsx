'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Users, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { settingsConfig, updateSettingsConfig, currentUser } = useApp();

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Form State
  const [freeRadiusInput, setFreeRadiusInput] = useState(settingsConfig.freeRadiusKm);
  const [firstExtraInput, setFirstExtraInput] = useState(settingsConfig.firstExtraKmCharge);
  const [perExtraInput, setPerExtraInput] = useState(settingsConfig.perExtraKmCharge);
  const [openingTimeInput, setOpeningTimeInput] = useState(settingsConfig.openingTime);
  const [closingTimeInput, setClosingTimeInput] = useState(settingsConfig.closingTime);
  const [slotDurationInput, setSlotDurationInput] = useState(settingsConfig.slotDurationHours);
  const [totalDriversInput, setTotalDriversInput] = useState(settingsConfig.totalDeliveryEmployees);
  const [maxDeliveriesPerDriver, setMaxDeliveriesPerDriver] = useState(settingsConfig.maxDeliveriesPerDriverPerSlot || 1);

  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsConfig({
      ...settingsConfig,
      freeRadiusKm: Number(freeRadiusInput),
      firstExtraKmCharge: Number(firstExtraInput),
      perExtraKmCharge: Number(perExtraInput),
      openingTime: openingTimeInput,
      closingTime: closingTimeInput,
      slotDurationHours: Number(slotDurationInput),
      totalDeliveryEmployees: Number(totalDriversInput),
      maxDeliveriesPerDriverPerSlot: Number(maxDeliveriesPerDriver),
    });

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Admin Only Access</h2>
          <p className="text-xs text-gray-500 mt-2">
            Master settings are restricted to <strong>Super Admin</strong>. Please switch to an admin account to configure operational parameters.
          </p>
        </div>
      </div>
    );
  }

  const computedSlotCapacity = Number(totalDriversInput) * Number(maxDeliveriesPerDriver);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="border-b border-amber-200/60 pb-4">
        <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
          Master Bakery Operations Settings
          <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2 py-0.5 rounded-full">
            Admin Controlled
          </span>
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          Configure operating hours, delivery slot duration, fleet capacity limits, and distance pricing formulas.
        </p>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          Operational settings successfully updated and saved across all teams!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Delivery Slots & Operating Hours */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">1. Operating Hours & Time Slot Intervals</h2>
              <p className="text-[11px] text-gray-500">Sets the first and last slots on the calendar and their interval duration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bakery Opening Time (First Slot Start):
              </label>
              <input
                type="time"
                value={openingTimeInput}
                onChange={e => setOpeningTimeInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bakery Closing Time (Last Slot End):
              </label>
              <input
                type="time"
                value={closingTimeInput}
                onChange={e => setClosingTimeInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Slot Interval Duration:
              </label>
              <select
                value={slotDurationInput}
                onChange={e => setSlotDurationInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold bg-white"
              >
                <option value={1}>1 Hour Slots (e.g. 10-11, 11-12)</option>
                <option value={2}>2 Hour Slots (e.g. 10-12, 12-2) [Recommended]</option>
                <option value={3}>3 Hour Slots (e.g. 10-1, 1-4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Fleet Size & Delivery Capacity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">2. Delivery Fleet & Slot Capacity Limits</h2>
              <p className="text-[11px] text-gray-500">Calculates max bookings allowed per time slot to prevent double-booking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total Delivery Employees / Riders:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={totalDriversInput}
                onChange={e => setTotalDriversInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
              <span className="text-[10px] text-gray-500">In-house bike delivery staff</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Max Deliveries per Rider per Slot:
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxDeliveriesPerDriver}
                onChange={e => setMaxDeliveriesPerDriver(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
              <span className="text-[10px] text-gray-500">Usually 1 for safe fragile cake handling</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
              <span className="text-xs text-amber-900 font-semibold">Resulting Slot Capacity:</span>
              <span className="text-2xl font-black text-amber-950">
                {computedSlotCapacity} Deliveries / Slot
              </span>
              <span className="text-[10px] text-gray-500">
                Slots mark as &ldquo;⛔ FULL&rdquo; once this limit is reached
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Distance Pricing Formula */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <IndianRupee className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">3. Trivandrum Distance Delivery Rates</h2>
              <p className="text-[11px] text-gray-500">Free delivery threshold and incremental excess kilometer pricing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Free Delivery Radius (km):
              </label>
              <input
                type="number"
                min="0"
                value={freeRadiusInput}
                onChange={e => setFreeRadiusInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
              <span className="text-[10px] text-gray-500">Deliveries within this radius are ₹0</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                1st Extra Km Charge (₹):
              </label>
              <input
                type="number"
                min="0"
                value={firstExtraInput}
                onChange={e => setFirstExtraInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
              <span className="text-[10px] text-gray-500">Base surcharge for 1st km over limit</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Subsequent Per Extra Km (₹):
              </label>
              <input
                type="number"
                min="0"
                value={perExtraInput}
                onChange={e => setPerExtraInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold"
                required
              />
              <span className="text-[10px] text-gray-500">Added for every additional km beyond</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save & Apply Master Settings
          </button>
        </div>

      </form>
    </div>
  );
};
