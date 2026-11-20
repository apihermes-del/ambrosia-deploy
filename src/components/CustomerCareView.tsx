'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderItem, OrderType, PaymentStatus } from '@/types';
import { 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Edit3, 
  XCircle, 
  AlertTriangle,
  Search,
  Calculator
} from 'lucide-react';
import { calculateDeliveryFee } from '@/lib/deliveryPricing';

export const CustomerCareView: React.FC = () => {
  const { createOrder, updateOrder, cancelOrder, orders, pricingConfig, currentUser } = useApp();
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'new_booking' | 'manage_orders'>('new_booking');

  // Order Search for management
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form State
  const [tallySONumber, setTallySONumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('home_delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('14:00 - 16:00');
  const [specialNotes, setSpecialNotes] = useState('');

  // Financials & Payment Status
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentStatusType, setPaymentStatusType] = useState<PaymentStatus>('partial');

  // Items List (Eggless option removed as per refinement 1)
  const [items, setItems] = useState<Omit<OrderItem, 'id' | 'order_id' | 'status'>[]>([
    {
      item_name: '',
      category: 'Cakes',
      size_or_weight: '1 kg',
      quantity: 1,
      cake_message: '',
      special_instructions: '',
      lead_time_minutes: 120,
    }
  ]);

  React.useEffect(() => {
    setDeliveryDate(new Date().toISOString().split('T')[0]);
  }, []);

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        item_name: '',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: '',
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

  const handleDistanceChange = (km: number) => {
    setDeliveryDistanceKm(km);
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

    const [startSlot] = deliveryTimeSlot.split('-').map(s => s.trim());
    const [hours, minutes] = (startSlot || '14:00').split(':').map(Number);
    const targetDate = new Date(deliveryDate);
    targetDate.setHours(isNaN(hours) ? 14 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);

    const deliveryFee = orderType === 'home_delivery' ? calculateDeliveryFee(deliveryDistanceKm, pricingConfig) : 0;

    if (editingOrder) {
      // Modifying existing order
      updateOrder(
        editingOrder.id,
        {
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
          delivery_distance_km: deliveryDistanceKm,
          delivery_charge: deliveryFee,
          total_amount: totalAmount,
          advance_paid: advancePaid,
          payment_status: paymentStatusType,
          special_notes: specialNotes.trim() || undefined,
          items: items.map((itm, idx) => ({
            ...itm,
            id: editingOrder.items[idx]?.id || `itm-${Date.now()}-${idx}`,
            order_id: editingOrder.id,
            status: editingOrder.items[idx]?.status || 'pending',
          })),
        },
        `Order details modified by ${currentUser.full_name}`
      );

      setSuccessBanner(`Order ${tallySONumber} has been updated and flagged for kitchen attention!`);
      setEditingOrder(null);
      setActiveTab('manage_orders');
    } else {
      // Creating fresh order
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
        delivery_distance_km: deliveryDistanceKm,
        delivery_charge: deliveryFee,
        status: 'new',
        assignment_type: 'unassigned',
        total_amount: totalAmount,
        advance_paid: advancePaid,
        payment_status: paymentStatusType,
        special_notes: specialNotes.trim() || undefined,
        items: items.map(itm => ({
          ...itm,
          id: '',
          order_id: '',
          status: 'pending',
        }))
      });

      setSuccessBanner(`Order ${tallySONumber} successfully pushed to Kitchen & Operations queue!`);
    }

    setTimeout(() => setSuccessBanner(null), 6000);

    // Reset Form
    setTallySONumber('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAltPhone('');
    setDeliveryArea('');
    setDeliveryAddress('');
    setDeliveryLandmark('');
    setDeliveryDistanceKm(0);
    setSpecialNotes('');
    setTotalAmount(0);
    setAdvancePaid(0);
    setPaymentStatusType('partial');
    setItems([
      {
        item_name: '',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: '',
        special_instructions: '',
        lead_time_minutes: 120,
      }
    ]);
  };

  const startEditOrder = (order: Order) => {
    setEditingOrder(order);
    setTallySONumber(order.tally_so_number);
    setOrderType(order.order_type);
    setCustomerName(order.customer_name);
    setCustomerPhone(order.customer_phone);
    setCustomerAltPhone(order.customer_alt_phone || '');
    setDeliveryArea(order.delivery_area);
    setDeliveryAddress(order.delivery_address || '');
    setDeliveryLandmark(order.delivery_landmark || '');
    setDeliveryDistanceKm(order.delivery_distance_km || 0);
    setDeliveryDate(order.delivery_date);
    setDeliveryTimeSlot(order.delivery_time_slot);
    setTotalAmount(order.total_amount);
    setAdvancePaid(order.advance_paid);
    setPaymentStatusType(order.payment_status);
    setSpecialNotes(order.special_notes || '');
    setItems(order.items.map(i => ({ ...i })));
    setActiveTab('new_booking');
  };

  const handleCancel = (order: Order) => {
    const reason = prompt(`Enter cancellation reason for ${order.tally_so_number}:`);
    if (reason && reason.trim()) {
      cancelOrder(order.id, reason.trim());
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.tally_so_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q) ||
      o.delivery_area.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Customer Care Desk
            <span className="text-xs bg-amber-100 text-amber-800 font-sans font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
              Booking & Order Admin
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Book advanced Tally orders, handle credit customers, edit active orders, or manage cancellations.
          </p>
        </div>

        {/* Tab switch: New Booking vs Manage Existing */}
        <div className="flex items-center gap-2 bg-amber-100/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setEditingOrder(null);
              setActiveTab('new_booking');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'new_booking' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            {editingOrder ? '✏️ Editing Order' : '+ New Order Entry'}
          </button>
          <button
            onClick={() => setActiveTab('manage_orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'manage_orders' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            Manage / Edit Orders ({orders.filter(o => !['delivered', 'collected', 'cancelled'].includes(o.status)).length})
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successBanner}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ORDER ENTRY / EDIT FORM */}
      {/* ========================================================================= */}
      {activeTab === 'new_booking' && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          
          {editingOrder && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-950 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Editing Active Order: <span className="font-mono">{editingOrder.tally_so_number}</span>. Changes will trigger an &ldquo;EDITED&rdquo; notice in the Kitchen board.
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingOrder(null);
                  setActiveTab('manage_orders');
                }}
                className="text-xs text-amber-900 hover:underline font-semibold"
              >
                Cancel Edit
              </button>
            </div>
          )}

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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                />
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98470 12340"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Schedule & Trivandrum Delivery Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Clock className="w-4 h-4 text-amber-600" />
              2. Delivery Schedule & Locality
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery / Pick up Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={e => setDeliveryTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="10:00 - 12:00">Morning (10:00 AM - 12:00 PM)</option>
                  <option value="12:00 - 14:00">Noon (12:00 PM - 02:00 PM)</option>
                  <option value="14:00 - 16:00">Afternoon (02:00 PM - 04:00 PM)</option>
                  <option value="16:00 - 18:00">Tea Time (04:00 PM - 06:00 PM)</option>
                  <option value="18:00 - 20:00">Evening (06:00 PM - 08:00 PM)</option>
                  <option value="20:00 - 22:00">Night (08:00 PM - 10:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alt Contact (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="Alternate phone / WhatsApp"
                  value={customerAltPhone}
                  onChange={e => setCustomerAltPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {orderType === 'home_delivery' && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    General Area / Suburb <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kawdiar, Sreekaryam, Pattom"
                    value={deliveryArea}
                    onChange={e => setDeliveryArea(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-700">Visible on dispatch board for routing</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Detailed Address & Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat #, Street, Near landmark (Masked to driver until out for delivery)"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Multi-Item Booking with Lead Times (Eggless removed) */}
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
                  className="p-4 rounded-xl border border-gray-200 bg-amber-50/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
                >
                  <div className="lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Belgian Chocolate Truffle Cake"
                      value={item.item_name}
                      onChange={e => updateItem(index, 'item_name', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 bg-white"
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
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Lead Time
                    </label>
                    <select
                      value={item.lead_time_minutes}
                      onChange={e => updateItem(index, 'lead_time_minutes', Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white font-medium text-amber-900"
                    >
                      <option value={60}>1 Hour before</option>
                      <option value={120}>2 Hours before (Standard)</option>
                      <option value={180}>3 Hours before</option>
                      <option value={240}>4 Hours before (Fondant/Art)</option>
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
                      placeholder="e.g. Happy 25th Birthday Sarah!"
                      value={item.cake_message || ''}
                      onChange={e => updateItem(index, 'cake_message', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-amber-300 bg-amber-50/50 rounded-md text-amber-950 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Special Design / Eggless Note (if rare)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rare eggless request, blue drip"
                      value={item.special_instructions || ''}
                      onChange={e => updateItem(index, 'special_instructions', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white"
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Payment Status with "Credit Order" option */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <IndianRupee className="w-4 h-4 text-amber-600" />
              4. Payment Status & Credit Booking
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Classification <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentStatusType}
                  onChange={e => setPaymentStatusType(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold bg-white"
                >
                  <option value="partial">Partial Advance (Balance COD)</option>
                  <option value="paid">100% Paid in Advance</option>
                  <option value="pending_cod">Full COD on Delivery</option>
                  <option value="credit">🏢 Credit Order (No cash collected)</option>
                </select>
                <span className="text-[10px] text-gray-500">Credit orders skip cash collection on delivery</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Order Value (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalAmount || ''}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-bold"
                />
              </div>

              {paymentStatusType !== 'credit' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Advance Paid in Tally (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={advancePaid || ''}
                    onChange={e => setAdvancePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className={`p-3 rounded-lg border ${
                paymentStatusType === 'credit'
                  ? 'bg-purple-50 border-purple-300 text-purple-950'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-xs font-semibold block">
                  {paymentStatusType === 'credit' ? 'Credit Order' : 'Pending Balance to Collect'}
                </span>
                <span className="text-xl font-black block mt-0.5">
                  {paymentStatusType === 'credit' ? '₹0.00 (Account Billed)' : `₹${Math.max(0, totalAmount - advancePaid)}`}
                </span>
                <span className="text-[10px] text-gray-500">
                  {paymentStatusType === 'credit' ? 'Invoice directly to corporate/VIP credit' : 'Collect on handover'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Internal Special Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. VIP client, call ahead, add sparkler candle"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {editingOrder ? 'Save Changes & Notify Kitchen' : 'Book & Send to Operations'}
            </button>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAGE / EDIT ACTIVE ORDERS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'manage_orders' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search active orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Orders can be edited or cancelled by Customer Care until marked &ldquo;Ready for Pick up&rdquo;.
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Tally SO #</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => {
                    const canEdit = !['ready_for_pickup', 'out_for_delivery', 'delivered', 'collected', 'cancelled'].includes(order.status);

                    return (
                      <tr key={order.id} className="hover:bg-amber-50/20">
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {order.tally_so_number}
                          {order.is_edited_flag && (
                            <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                              EDITED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{order.delivery_time_slot}</div>
                          <div className="text-[10px] text-gray-500">{order.delivery_date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{order.customer_name}</div>
                          <div className="text-[11px] text-gray-500">{order.delivery_area}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-700">
                            {order.items.map(i => i.item_name).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {order.payment_status === 'credit' ? (
                            <span className="text-purple-700 font-bold">CREDIT</span>
                          ) : (
                            <span>₹{order.pending_amount} DUE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canEdit ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditOrder(order)}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleCancel(order)}
                                className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Locked in operations</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
