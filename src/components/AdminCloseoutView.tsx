'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  FileCheck, 
  IndianRupee, 
  CheckCircle2, 
  UserCheck, 
  Store, 
  Truck,
  ArrowRight
} from 'lucide-react';

export const AdminCloseoutView: React.FC = () => {
  const { 
    orders, 
    users, 
    updateTallySINumber, 
    closeDriverDay, 
    closeAdminDayReconciliation, 
    currentUser 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'driver_closeout' | 'outlet_cashier' | 'tally_si'>('driver_closeout');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [siInput, setSiInput] = useState('');

  // Drivers and Delivery Leads who do delivery trips
  const deliveryBoys = users.filter(u => u.role === 'delivery' || u.role === 'delivery_lead');
  
  // If user is a driver or delivery_lead, default or constrain selection
  const isIndividualRiderView = currentUser?.role === 'delivery';
  const initialDriverId = isIndividualRiderView ? currentUser.id : (currentUser?.role === 'delivery_lead' ? currentUser.id : 'u5');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(initialDriverId);

  // If a driver logs in, strictly force them to only inspect their own account
  const effectiveDriverId = isIndividualRiderView ? (currentUser?.id || selectedDriverId) : selectedDriverId;
  const selectedDriver = deliveryBoys.find(d => d.id === effectiveDriverId) || deliveryBoys[0];

  // Orders delivered by selected driver
  const driverDeliveredOrders = orders.filter(
    o => o.assigned_delivery_user_id === effectiveDriverId && o.status === 'delivered'
  );

  // Driver collections breakdown
  const driverCash = driverDeliveredOrders
    .filter(o => o.delivery_payment_mode === 'cash')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);

  const driverUpi = driverDeliveredOrders
    .filter(o => o.delivery_payment_mode === 'upi_qr')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);

  const driverCard = driverDeliveredOrders
    .filter(o => o.delivery_payment_mode === 'card')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);

  const driverTotal = driverCash + driverUpi + driverCard;
  const isDriverClosed = driverDeliveredOrders.length > 0 && driverDeliveredOrders.every(o => o.driver_day_closed);

  // OVERALL OUTLET & CUSTOMER CARE COLLECTIONS (All delivered + collected orders)
  const completedOrders = orders.filter(o => ['delivered', 'collected'].includes(o.status));

  // Advance paid collected by desk + on-field driver collections
  const totalAdvanceCollected = completedOrders.reduce((sum, o) => sum + (o.advance_paid || 0), 0);
  const totalOnFieldCash = completedOrders
    .filter(o => o.delivery_payment_mode === 'cash')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);
  const totalOnFieldUpi = completedOrders
    .filter(o => o.delivery_payment_mode === 'upi_qr')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);
  const totalOnFieldCard = completedOrders
    .filter(o => o.delivery_payment_mode === 'card')
    .reduce((sum, o) => sum + (o.delivery_payment_collected || 0), 0);

  const grandTotalBusiness = totalAdvanceCollected + totalOnFieldCash + totalOnFieldUpi + totalOnFieldCard;

  const handleSaveSI = (orderId: string) => {
    if (!siInput.trim()) return;
    updateTallySINumber(orderId, siInput.trim().toUpperCase());
    setEditingOrderId(null);
    setSiInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Operations Closeout & Cashier Settlement
            <span className="text-xs bg-emerald-600 text-white font-sans font-semibold px-2 py-0.5 rounded-full">
              Day Close
            </span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Two-stage financial settlement: 1) Settle individual driver cash/UPI, 2) Hand over total collections to main outlet cashier.
          </p>
        </div>

        {/* Sub-tab selection - hidden or simplified for individual drivers */}
        {!isIndividualRiderView ? (
          <div className="flex items-center gap-1.5 bg-amber-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('driver_closeout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'driver_closeout' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-amber-900 hover:bg-amber-200/70'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              1. Driver Day Close
            </button>
            <button
              onClick={() => setActiveSubTab('outlet_cashier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'outlet_cashier' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-amber-900 hover:bg-amber-200/70'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              2. Main Outlet Cashier Handover
            </button>
            <button
              onClick={() => setActiveSubTab('tally_si')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'tally_si' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-amber-900 hover:bg-amber-200/70'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              3. Tally SI Closeout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-100/90 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>My Daily Delivery Cash & Settlement</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. INDIVIDUAL DRIVER DAY CLOSEOUT (Refinement 12) */}
      {/* ========================================================================= */}
      {activeSubTab === 'driver_closeout' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  Rider Daily Settlement
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify how much cash, UPI, and card each delivery boy collected before clearing their shift.
                </p>
              </div>

              {/* Select Driver: only super_admin, customer_care, and delivery_lead can pick other drivers */}
              {!isIndividualRiderView ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Select Rider:</span>
                  <select
                    value={effectiveDriverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 bg-white"
                  >
                    {deliveryBoys.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} {d.role === 'delivery_lead' ? '(Lead & Rider)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  Rider: {selectedDriver?.full_name || currentUser?.full_name}
                </div>
              )}
            </div>

            {/* Selected Driver Collection Card */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs text-amber-900 font-semibold block">Cash in Hand</span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">₹{driverCash}</span>
                <span className="text-[10px] text-gray-500">Collect physical cash from {selectedDriver.full_name}</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-xs text-blue-900 font-semibold block">UPI / QR Collected</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">₹{driverUpi}</span>
                <span className="text-[10px] text-gray-500">Digital bakery bank account deposits</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-xs text-purple-900 font-semibold block">Card Machine</span>
                <span className="text-2xl font-black text-purple-950 mt-1 block">₹{driverCard}</span>
                <span className="text-[10px] text-gray-500">POS machine slip amount</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-900 font-bold block">Total Handed Over</span>
                  <span className="text-2xl font-black text-emerald-950 mt-1 block">₹{driverTotal}</span>
                </div>
                
                <button
                  disabled={isDriverClosed || driverDeliveredOrders.length === 0}
                  onClick={() => closeDriverDay(effectiveDriverId)}
                  className={`w-full py-2 text-xs font-bold rounded-lg mt-3 transition-colors ${
                    isDriverClosed
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  {isDriverClosed ? '✓ Shift Day Closed' : `Settle & Close ${selectedDriver?.full_name?.split(' ')[0] || 'Rider'}'s Day`}
                </button>
              </div>
            </div>

            {/* List of orders delivered by this driver */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Delivered Orders Breakdown ({driverDeliveredOrders.length})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                {driverDeliveredOrders.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No orders marked delivered by this rider yet.
                  </div>
                ) : (
                  driverDeliveredOrders.map(o => (
                    <div key={o.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <span className="font-mono font-bold text-amber-950">{o.tally_so_number}</span>
                        <span className="text-gray-800 font-semibold ml-2">{o.customer_name}</span>
                        <span className="text-gray-500 text-[11px] ml-2">({o.delivery_area})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          Mode: <strong className="text-gray-900 uppercase">{o.delivery_payment_mode}</strong>
                        </span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ₹{o.delivery_payment_collected}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OVERALL MAIN OUTLET CASHIER HANDOVER (Refinement 12) */}
      {/* ========================================================================= */}
      {activeSubTab === 'outlet_cashier' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-600" />
                Main Outlet Cashier Master Settlement
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Consolidated tally of all Customer Care advance bookings + all field driver collections to hand over to the store cashier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-900 font-semibold block">Total Cash to Hand Over</span>
                <span className="text-3xl font-black text-amber-950 mt-1 block">₹{totalOnFieldCash}</span>
                <span className="text-[10px] text-gray-500">Physical cash collected from riders</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-900 font-semibold block">Total UPI Received</span>
                <span className="text-3xl font-black text-blue-950 mt-1 block">₹{totalOnFieldUpi}</span>
                <span className="text-[10px] text-gray-500">Verified digital QR collections</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-xs text-purple-900 font-semibold block">Total Card & Online</span>
                <span className="text-3xl font-black text-purple-950 mt-1 block">₹{totalOnFieldCard + totalAdvanceCollected}</span>
                <span className="text-[10px] text-gray-500">Includes CC advances & POS card machine</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-600 text-white flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold block text-emerald-100">Grand Total Business</span>
                  <span className="text-3xl font-black mt-1 block">₹{grandTotalBusiness}</span>
                </div>
                <button
                  onClick={closeAdminDayReconciliation}
                  className="w-full py-2 bg-white text-emerald-950 hover:bg-emerald-50 font-bold rounded-lg text-xs mt-3 shadow-sm transition-colors"
                >
                  Hand Over to Cashier & Reconcile Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TALLY SALES INVOICE (SI) NUMBER RECORDING */}
      {/* ========================================================================= */}
      {activeSubTab === 'tally_si' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Closed Orders Awaiting Tally Sales Invoice (SI) Number
            </h3>
            <span className="text-xs text-gray-500">
              {completedOrders.filter(o => !o.tally_si_number).length} Pending SI Recording
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Tally SO #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Tally SI Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedOrders.map(order => {
                  const isEditing = editingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-amber-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-amber-950">
                        {order.tally_so_number}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100">
                          {order.order_type === 'home_delivery' ? 'Home' : 'Outlet'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        ₹{order.total_amount}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {order.payment_status === 'credit' ? 'CREDIT' : 'SETTLED'}
                      </td>
                      <td className="py-3 px-4">
                        {order.tally_si_number ? (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                            {order.tally_si_number}
                          </span>
                        ) : isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. SI-2026-1044"
                              value={siInput}
                              onChange={e => setSiInput(e.target.value)}
                              className="w-32 px-2 py-1 text-xs font-mono uppercase border border-amber-400 rounded outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSI(order.id)}
                              className="px-2 py-1 text-xs font-bold bg-amber-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="px-1.5 py-1 text-xs text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingOrderId(order.id);
                              setSiInput('');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors"
                          >
                            + Enter Tally SI #
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
