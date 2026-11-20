'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserProfile } from '@/types';
import { 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Users, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  ChefHat,
  Store,
  Plus,
  Trash2
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { 
    settingsConfig, 
    updateSettingsConfig, 
    kitchens, 
    pickupLocations, 
    addPickupLocation, 
    removePickupLocation, 
    addKitchen, 
    removeKitchen,
    users,
    addUser,
    removeUser,
    currentUser 
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Form State
  const [freeRadiusInput, setFreeRadiusInput] = useState(settingsConfig.freeRadiusKm);
  const [firstExtraInput, setFirstExtraInput] = useState(settingsConfig.firstExtraKmCharge);
  const [perExtraInput, setPerExtraInput] = useState(settingsConfig.perExtraKmCharge);
  const [openingTimeInput, setOpeningTimeInput] = useState(settingsConfig.openingTime);
  const [closingTimeInput, setClosingTimeInput] = useState(settingsConfig.closingTime);
  const [slotDurationInput, setSlotDurationInput] = useState(settingsConfig.slotDurationHours);
  const [totalDriversInput, setTotalDriversInput] = useState(settingsConfig.totalDeliveryEmployees);
  const [maxDeliveriesPerDriver, setMaxDeliveriesPerDriver] = useState(settingsConfig.maxDeliveriesPerDriverPerSlot || 1);
  const [defaultLeadTimeInput, setDefaultLeadTimeInput] = useState(settingsConfig.defaultLeadTimeMinutes || 120);

  // New employee state
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePhone, setNewEmployeePhone] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<UserProfile['role']>('customer_care');
  const [newEmployeeDepartment, setNewEmployeeDepartment] = useState('');

  // New location inputs
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationCategory, setNewLocationCategory] = useState<'outlet_chiller' | 'cake_section' | 'outlet_counter'>('outlet_chiller');

  // New kitchen input
  const [newKitchenName, setNewKitchenName] = useState('');

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
      defaultLeadTimeMinutes: Number(defaultLeadTimeInput),
    });

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 4000);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    addPickupLocation(newLocationName.trim(), newLocationCategory);
    setNewLocationName('');
  };

  const handleCreateKitchen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitchenName.trim()) return;
    addKitchen(newKitchenName.trim());
    setNewKitchenName('');
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName.trim() || !newEmployeePhone.trim()) {
      alert('Please enter employee name and phone number');
      return;
    }
    addUser(newEmployeeName, newEmployeePhone, newEmployeeRole, newEmployeeDepartment);
    setNewEmployeeName('');
    setNewEmployeePhone('');
    setNewEmployeeDepartment('');
  };

  const handleRemoveEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the system? They will no longer be able to log in.`)) {
      removeUser(id);
    }
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Default Cake Prep Lead Time:
              </label>
              <select
                value={defaultLeadTimeInput}
                onChange={e => setDefaultLeadTimeInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg font-bold bg-amber-50/50 text-amber-950"
              >
                <option value={60}>1 Hour (60 mins)</option>
                <option value={90}>1.5 Hours (90 mins)</option>
                <option value={120}>2 Hours (120 mins) [Default]</option>
                <option value={180}>3 Hours (180 mins)</option>
                <option value={240}>4 Hours (240 mins)</option>
                <option value={360}>6 Hours (360 mins)</option>
              </select>
              <span className="text-[10px] text-gray-500">Auto-assigned when new items are added in Customer Care</span>
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

        {/* Section 4: Chillers & Pick Up Locations Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-600" />
              <div>
                <h2 className="text-sm font-bold text-gray-900">4. Chiller & Pick Up Locations Configuration</h2>
                <p className="text-[11px] text-gray-500">Configure outlet chillers, cake section dispatch, and counter pick up locations</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg">
              {pickupLocations.length} Configured Locations
            </span>
          </div>

          {/* Existing Locations List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pickupLocations.map(loc => (
              <div 
                key={loc.id} 
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900 block">{loc.name}</span>
                  <span className="text-[10px] text-purple-700 capitalize font-medium">
                    Type: {loc.category.replace('_', ' ')}
                  </span>
                </div>
                {pickupLocations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePickupLocation(loc.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Location Form */}
          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-2">+ Add New Chiller / Pick Up Location:</h3>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Outlet Chiller 3, Cake Section Dispatch Chiller 2..."
                value={newLocationName}
                onChange={e => setNewLocationName(e.target.value)}
                className="flex-1 w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
              <select
                value={newLocationCategory}
                onChange={e => setNewLocationCategory(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 text-xs border border-gray-300 rounded-lg font-medium bg-white"
              >
                <option value="outlet_chiller">🏪 Outlet Chiller (Counter Pickup)</option>
                <option value="cake_section">🚚 Cake Section (Driver Dispatch)</option>
                <option value="outlet_counter">🧁 Counter Display</option>
              </select>
              <button
                type="button"
                onClick={handleCreateLocation}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Location
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Kitchens & Cake Production Units */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-sm font-bold text-gray-900">5. Kitchens & Production Units</h2>
                <p className="text-[11px] text-gray-500">Configure distinct kitchen units (e.g. Sponge, Icing, Fondant, Desserts)</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
              {kitchens.length} Kitchens
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {kitchens.map(k => (
              <div 
                key={k.id} 
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-gray-900">{k.name}</span>
                {kitchens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKitchen(k.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Kitchen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-2">+ Add New Kitchen Unit:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Kitchen 4 - Custom Wedding & Tier Studio..."
                value={newKitchenName}
                onChange={e => setNewKitchenName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleCreateKitchen}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Kitchen
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: User & Employee Management (Role & Phone Login) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-gray-900">6. Employee & User Account Management</h2>
                <p className="text-[11px] text-gray-500">Configure authorised staff, assigned department, and mobile number used for OTP login</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg">
              {users.length} Active Staff
            </span>
          </div>

          {/* Current Staff List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department / Role</th>
                  <th className="py-2.5 px-3">Login Phone (OTP)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-indigo-50/20">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {u.full_name}
                      {u.id === currentUser?.id && (
                        <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                        {u.role.replace('_', ' ')}
                      </span>
                      {u.department && u.department !== u.role && (
                        <span className="text-[10px] text-gray-500 ml-1.5">({u.department})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-gray-700">
                      {u.phone_number}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {u.id !== currentUser?.id && users.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(u.id, u.full_name)}
                          className="px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-1 ml-auto"
                          title="Remove employee from organisation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Employee Form */}
          <div className="pt-4 border-t border-gray-100 bg-[#FBFBFD] p-4 rounded-xl border">
            <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add New Employee / Team Member:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Nair"
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Department / System Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newEmployeeRole}
                  onChange={e => setNewEmployeeRole(e.target.value as UserProfile['role'])}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white font-medium"
                >
                  <option value="customer_care">Customer Care Desk</option>
                  <option value="cake_setting">Cake Setting & Kitchen</option>
                  <option value="delivery_lead">Delivery Assignment Lead</option>
                  <option value="delivery">Delivery Rider</option>
                  <option value="outlet">Outlet Counter Handover</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Department Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Shift Kitchen"
                  value={newEmployeeDepartment}
                  onChange={e => setNewEmployeeDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Mobile Number (OTP Login) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9847012349"
                  value={newEmployeePhone}
                  onChange={e => setNewEmployeePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white font-mono"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Employee
              </button>
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
