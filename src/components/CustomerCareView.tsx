'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OrderItem, OrderType } from '@/types';
import { Plus, Trash2, Calendar, Clock, MapPin, IndianRupee, Sparkles, CheckCircle, FileText } from 'lucide-react';

export const CustomerCareView: React.FC = () => {
  const { createOrder, orders } = useApp();
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form State
  const [tallySONumber, setTallySONumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('home_delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  React.useEffect(() => {
    setDeliveryDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('14:00 - 16:00');
  const [specialNotes, setSpecialNotes] = useState('');

  // Financials
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);

  // Items List
  const [items, setItems] = useState<Omit<OrderItem, 'id' | 'order_id' | 'status'>[]>([
    {
      item_name: '',
      category: 'Cakes',
      size_or_weight: '1 kg',
      quantity: 1,
      cake_message: '',
      egg_preference: 'eggless',
      special_instructions: '',
      lead_time_minutes: 120,
    }
  ]);

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        item_name: '',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: '',
        egg_preference: 'eggless',
        special_instructions: '',
        lead_time_minutes: 120,
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateItem = (index: number, field: string, val: any) => {
    setItems(prev => prev.map((itm, idx) => idx === index ? { ...itm, [field]: val } : itm));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tallySONumber.trim() || !customerName.trim() || !customerPhone.trim()) {
      alert('Please fill out Tally Sales Order #, Customer Name, and Phone Number.');
      return;
    }

    if (items.some(i => !i.item_name.trim())) {
      alert('Please ensure all items have a name specified.');
      return;
    }

    // Calculate target delivery timestamp
    const [startSlot] = deliveryTimeSlot.split('-').map(s => s.trim());
    const [hours, minutes] = (startSlot || '14:00').split(':').map(Number);
    const targetDate = new Date(deliveryDate);
    targetDate.setHours(isNaN(hours) ? 14 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);

    const pending = Math.max(0, totalAmount - advancePaid);
    const paymentStatus = pending === 0 ? 'paid' : advancePaid > 0 ? 'partial' : 'pending_cod';

    createOrder({
      tally_so_number: tallySONumber.trim(),
      order_type: orderType,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_alt_phone: customerAltPhone.trim() || undefined,
      delivery_area: orderType === 'home_delivery' ? deliveryArea.trim() : 'Ambrosia Outlet Pick up',
      delivery_address: orderType === 'home_delivery' ? deliveryAddress.trim() : undefined,
      delivery_landmark: orderType === 'home_delivery' ? deliveryLandmark.trim() : undefined,
      delivery_date: deliveryDate,
      delivery_time_slot: deliveryTimeSlot,
      target_delivery_time: targetDate.toISOString(),
      status: 'new',
      total_amount: totalAmount,
      advance_paid: advancePaid,
      payment_status: paymentStatus,
      special_notes: specialNotes.trim() || undefined,
      items: items.map(itm => ({
        ...itm,
        id: '',
        order_id: '',
        status: 'pending',
      }))
    });

    setSuccessBanner(`Order ${tallySONumber} successfully pushed to Kitchen & Operations queue!`);
    setTimeout(() => setSuccessBanner(null), 6000);

    // Reset Form
    setTallySONumber('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAltPhone('');
    setDeliveryArea('');
    setDeliveryAddress('');
    setDeliveryLandmark('');
    setSpecialNotes('');
    setTotalAmount(0);
    setAdvancePaid(0);
    setItems([
      {
        item_name: '',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: '',
        egg_preference: 'eggless',
        special_instructions: '',
        lead_time_minutes: 120,
      }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Customer Care Desk
            <span className="text-xs bg-amber-100 text-amber-800 font-sans font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
              New Booking Entry
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter advanced sales order details from Tally to schedule production lead times and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-right">
            <span className="text-xs text-amber-700 block font-medium">Active Bookings in System</span>
            <span className="text-xl font-bold text-amber-950">{orders.length} Orders</span>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successBanner}</span>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        
        {/* Step 1: Tally & Customer Identification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <FileText className="w-4 h-4 text-amber-600" />
            1. Tally Order & Fulfillment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tally Sales Order (SO) Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SO-2026-0941"
                value={tallySONumber}
                onChange={e => setTallySONumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono uppercase"
              />
              <span className="text-[10px] text-gray-500">Alphanumeric voucher number from Tally</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Order Type / Fulfillment <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('home_delivery')}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    orderType === 'home_delivery'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  🚚 Home Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('outlet_pickup')}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    orderType === 'outlet_pickup'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  🏪 Outlet Pick up
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Customer full name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Schedule & Address (with area masking separation) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <Clock className="w-4 h-4 text-amber-600" />
            2. Delivery Schedule & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Delivery / Pick up Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Time Slot / Required Time <span className="text-red-500">*</span>
              </label>
              <select
                value={deliveryTimeSlot}
                onChange={e => setDeliveryTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="10:00 - 12:00">Morning (10:00 AM - 12:00 PM)</option>
                <option value="12:00 - 14:00">Noon (12:00 PM - 02:00 PM)</option>
                <option value="14:00 - 16:00">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="16:00 - 18:00">Tea Time (04:00 PM - 06:00 PM)</option>
                <option value="18:00 - 20:00">Evening (06:00 PM - 08:00 PM)</option>
                <option value="20:00 - 22:00">Night (08:00 PM - 10:00 PM)</option>
                <option value="Exact Time: 13:00">Exact Time: 01:00 PM</option>
                <option value="Exact Time: 16:30">Exact Time: 04:30 PM</option>
                <option value="Exact Time: 19:30">Exact Time: 07:30 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alt Phone / WhatsApp (Optional)
              </label>
              <input
                type="tel"
                placeholder="Alternate contact"
                value={customerAltPhone}
                onChange={e => setCustomerAltPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {orderType === 'home_delivery' && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  General Delivery Area / Suburb <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiranagar, Koramangala 4th Block"
                  value={deliveryArea}
                  onChange={e => setDeliveryArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-amber-700">Visible to delivery driver for morning routing planning</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Detailed Address & Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat #, Apt name, Road #, Landmark (masked to rider until out for delivery)"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-gray-500">Full address is securely masked until rider starts trip</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Multi-Item Booking with Lead Times */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              3. Ordered Items & Kitchen Lead Times
            </h2>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div 
                key={index} 
                className="p-4 rounded-xl border border-gray-200 bg-amber-50/20 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
              >
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dutch Truffle Chocolate Cake"
                    value={item.item_name}
                    onChange={e => updateItem(index, 'item_name', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Size / Weight
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg, 500g, 4 pcs"
                    value={item.size_or_weight}
                    onChange={e => updateItem(index, 'size_or_weight', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Egg / Eggless
                  </label>
                  <select
                    value={item.egg_preference}
                    onChange={e => updateItem(index, 'egg_preference', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="eggless">🌱 Eggless</option>
                    <option value="with_egg">🥚 With Egg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Lead Time
                  </label>
                  <select
                    value={item.lead_time_minutes}
                    onChange={e => updateItem(index, 'lead_time_minutes', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none bg-white font-medium text-amber-900"
                  >
                    <option value={60}>1 Hour before</option>
                    <option value={120}>2 Hours before (Standard)</option>
                    <option value={180}>3 Hours before</option>
                    <option value={240}>4 Hours before (Fondant/Custom)</option>
                    <option value={360}>6 Hours before (Tiered/Sculpted)</option>
                  </select>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md text-center bg-white"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Message on Cake */}
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Cake Inscription / Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Happy 30th Birthday Rahul!"
                    value={item.cake_message || ''}
                    onChange={e => updateItem(index, 'cake_message', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 bg-amber-50/50 rounded-md focus:ring-1 focus:ring-amber-500 outline-none text-amber-950 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Special Design Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blue border, no nuts"
                    value={item.special_instructions || ''}
                    onChange={e => updateItem(index, 'special_instructions', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 outline-none bg-white"
                  />
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Payment Balances & Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <IndianRupee className="w-4 h-4 text-amber-600" />
            4. Payment Status & Order Handover Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Total Order Value (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0.00"
                  value={totalAmount || ''}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Advance Paid in Tally (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={advancePaid || ''}
                  onChange={e => setAdvancePaid(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
                />
              </div>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">Pending Balance to Collect</span>
              <span className={`text-2xl font-black ${totalAmount - advancePaid > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{Math.max(0, totalAmount - advancePaid)}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                {totalAmount - advancePaid > 0 ? 'To be collected by Delivery Driver / Counter' : 'Fully Paid Online / Advance'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Internal Notes / Special Request (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. VIP client, customer requested extra packing or birthday sparkler"
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Book & Send to Kitchen Queue
          </button>
        </div>

      </form>
    </div>
  );
};
