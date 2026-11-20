'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, PaymentMode } from '@/types';
import { 
  Truck, 
  UserCheck, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Lock, 
  Unlock, 
  Eye, 
  ShieldAlert,
  Calendar,
  Clock
} from 'lucide-react';

export const DeliveryDispatchView: React.FC = () => {
  const { 
    orders, 
    users, 
    currentUser, 
    onDutyDrivers, 
    toggleDriverDuty, 
    assignDeliveryBoy, 
    updateOrderStatus, 
    markDelivered 
  } = useApp();

  const [deliveryTab, setDeliveryTab] = useState<'roster' | 'dispatch' | 'my_deliveries'>('my_deliveries');
  const [activeDriverId, setActiveDriverId] = useState<string>(currentUser.role === 'delivery' ? currentUser.id : 'u5');
  
  // Delivery Completion Modal State
  const [deliveredModalOrder, setDeliveredModalOrder] = useState<Order | null>(null);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi_qr');

  // Filter home delivery orders
  const homeDeliveryOrders = orders.filter(o => o.order_type === 'home_delivery');

  // Delivery drivers list
  const deliveryBoys = users.filter(u => u.role === 'delivery');
  const onDutyDeliveryBoys = deliveryBoys.filter(u => onDutyDrivers.includes(u.id));

  // Orders assigned to selected driver
  const myAssignedOrders = homeDeliveryOrders.filter(o => o.assigned_delivery_user_id === activeDriverId);

  const handleStartDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'out_for_delivery');
  };

  const openDeliveredModal = (order: Order) => {
    setDeliveredModalOrder(order);
    setCollectedAmount(order.pending_amount);
    setPaymentMode(order.pending_amount > 0 ? 'cash' : 'none');
  };

  const handleConfirmDelivery = () => {
    if (!deliveredModalOrder) return;
    markDelivered(deliveredModalOrder.id, collectedAmount, paymentMode);
    setDeliveredModalOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Home Delivery Operations
            <span className="text-xs bg-blue-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Dispatch & Rider View
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Morning driver roster, order dispatch assignment, address unlocking, and on-field payment collection.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-amber-100/80 p-1 rounded-xl">
          <button
            onClick={() => setDeliveryTab('my_deliveries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deliveryTab === 'my_deliveries' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Driver App View
          </button>
          <button
            onClick={() => setDeliveryTab('dispatch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deliveryTab === 'dispatch' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Team Dispatch Board
          </button>
          <button
            onClick={() => setDeliveryTab('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deliveryTab === 'roster' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Morning Duty Roster ({onDutyDrivers.length})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MORNING ROSTER VIEW */}
      {/* ============================================================== */}
      {deliveryTab === 'roster' && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                Delivery Staff Daily Attendance
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Team Lead marks which delivery boys are on duty today. Only on-duty drivers will be available for order assignments.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-lg">
              Daily Attendance Roster
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deliveryBoys.map(driver => {
              const isOnDuty = onDutyDrivers.includes(driver.id);
              const assignedCount = homeDeliveryOrders.filter(o => o.assigned_delivery_user_id === driver.id && o.status !== 'delivered').length;

              return (
                <div 
                  key={driver.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isOnDuty 
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200' 
                      : 'bg-gray-50/60 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                      {driver.full_name[0]}
                    </div>
                    <button
                      onClick={() => toggleDriverDuty(driver.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        isOnDuty 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isOnDuty ? '✓ On Duty' : 'Off Duty'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="font-bold text-gray-900 text-sm">{driver.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {driver.phone_number}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Active Deliveries:</span>
                    <span className="font-bold text-gray-900">{assignedCount} orders</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TEAM DISPATCH BOARD (LEAD VIEW) */}
      {/* ============================================================== */}
      {deliveryTab === 'dispatch' && (
        <div className="mt-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
            <span className="font-medium">
              💡 <strong>Dispatch Tip:</strong> Orders booked across the next few days are shown below. Assign to on-duty riders in the morning based on their locality route.
            </span>
            <span className="font-bold px-2.5 py-1 bg-amber-200/80 rounded-md">
              {onDutyDeliveryBoys.length} Drivers On Duty Today
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Delivery Orders Schedule</h2>
              <span className="text-xs text-gray-500">{homeDeliveryOrders.length} Total Delivery Bookings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Tally SO #</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Customer & General Area</th>
                    <th className="py-3 px-4">Cakes / Items</th>
                    <th className="py-3 px-4">Kitchen Stage</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Payment Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {homeDeliveryOrders.map(order => {
                    const assignedDriver = users.find(u => u.id === order.assigned_delivery_user_id);
                    return (
                      <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-950">
                          {order.tally_so_number}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{order.delivery_time_slot}</div>
                          <div className="text-[10px] text-gray-500">{order.delivery_date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{order.customer_name}</div>
                          <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {order.delivery_area}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {order.items.map(i => (
                              <div key={i.id} className="text-gray-700">
                                • {i.item_name} ({i.size_or_weight})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'ready_for_pickup' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.assigned_delivery_user_id || ''}
                            onChange={e => assignDeliveryBoy(order.id, e.target.value)}
                            className="text-xs py-1 px-2 rounded-lg border border-gray-300 bg-white font-medium focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="">-- Assign Rider --</option>
                            {onDutyDeliveryBoys.map(d => (
                              <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          {order.pending_amount > 0 ? (
                            <span className="text-rose-600 font-black">₹{order.pending_amount} DUE</span>
                          ) : (
                            <span className="text-emerald-600">PAID</span>
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

      {/* ============================================================== */}
      {/* 3. DRIVER PERSONAL MOBILE VIEW */}
      {/* ============================================================== */}
      {deliveryTab === 'my_deliveries' && (
        <div className="mt-6 space-y-6">
          
          {/* Driver Switcher bar for testing / simulation */}
          <div className="bg-amber-900/10 border border-amber-300/80 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950">Active Driver Logged In:</span>
              <select
                value={activeDriverId}
                onChange={e => setActiveDriverId(e.target.value)}
                className="text-xs font-bold py-1 px-2.5 rounded-lg border border-amber-400 bg-white text-amber-950 focus:ring-1 focus:ring-amber-500"
              >
                {deliveryBoys.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} {onDutyDrivers.includes(d.id) ? '(On Duty)' : '(Off Duty)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-gray-700">
              Orders Assigned Today: <span className="font-black text-amber-950">{myAssignedOrders.length}</span>
            </div>
          </div>

          {/* Cards for Assigned Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myAssignedOrders.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-700">No Orders Assigned Yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  When the delivery lead assigns orders to you from the dispatch board, they will appear here.
                </p>
              </div>
            ) : (
              myAssignedOrders.map(order => {
                const isDispatched = order.status === 'out_for_delivery';
                const isDelivered = order.status === 'delivered';
                const isReadyInChiller = order.status === 'ready_for_pickup';

                return (
                  <div 
                    key={order.id} 
                    className={`bg-white rounded-2xl border shadow-md transition-all overflow-hidden flex flex-col justify-between ${
                      isDelivered 
                        ? 'border-gray-200 bg-gray-50/50 opacity-80' 
                        : isDispatched 
                        ? 'border-blue-400 ring-2 ring-blue-300' 
                        : 'border-amber-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/40 to-blue-50/30">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded">
                          {order.tally_so_number}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isDelivered ? 'bg-emerald-100 text-emerald-800' :
                          isDispatched ? 'bg-blue-600 text-white animate-pulse' :
                          'bg-amber-200 text-amber-900'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-amber-900 font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            {order.delivery_area}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 block">{order.delivery_time_slot}</span>
                          <span className="text-[10px] text-gray-500">{order.delivery_date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Items to Pick Up:
                        </span>
                        {order.items.map(item => (
                          <div key={item.id} className="text-xs font-medium text-gray-800">
                            • {item.item_name} ({item.size_or_weight} • Qty: {item.quantity})
                          </div>
                        ))}
                      </div>

                      {/* Payment Due Warning */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        order.pending_amount > 0 
                          ? 'bg-rose-50 border-rose-200 text-rose-900' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4" />
                          <span className="text-xs font-bold">
                            {order.pending_amount > 0 ? 'Collect Balance at Doorstep:' : 'Already Paid in Full'}
                          </span>
                        </div>
                        <span className="text-sm font-black">
                          {order.pending_amount > 0 ? `₹${order.pending_amount}` : '₹0'}
                        </span>
                      </div>

                      {/* Masked Address vs Unlocked Address */}
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                        {!isDispatched && !isDelivered ? (
                          <div className="flex items-start gap-2.5 text-xs text-gray-600">
                            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-gray-900">Address & Contact Masked</div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Pick up the cake from <strong>Cake Section Chiller</strong> and tap <strong>&ldquo;Out for Delivery&rdquo;</strong> to unlock house number, customer phone, and GPS navigation.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                                <Unlock className="w-3 h-3" /> Unlocked Address & Contact
                              </span>
                            </div>

                            <div className="text-xs text-gray-900 font-medium bg-white p-2.5 rounded-lg border border-gray-200">
                              <div className="font-bold">{order.delivery_address}</div>
                              {order.delivery_landmark && (
                                <div className="text-[11px] text-gray-500 mt-0.5">Landmark: {order.delivery_landmark}</div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Call Customer
                              </a>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((order.delivery_address || order.delivery_area) + ', Bangalore')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                Google Maps
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      {isDelivered ? (
                        <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Successfully Delivered
                          </span>
                          <span className="text-gray-500 font-normal">
                            Collected: ₹{order.delivery_payment_collected} via {order.delivery_payment_mode?.toUpperCase()}
                          </span>
                        </div>
                      ) : !isDispatched ? (
                        <button
                          onClick={() => handleStartDelivery(order)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <Truck className="w-4 h-4" />
                          Picked from Cake Section & Start Delivery
                        </button>
                      ) : (
                        <button
                          onClick={() => openDeliveredModal(order)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Order as Delivered
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Mark Delivered & Record Payment */}
      {deliveredModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-300 animate-scale-up">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Complete Delivery Handover
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Order: <strong className="font-mono">{deliveredModalOrder.tally_so_number}</strong> for {deliveredModalOrder.customer_name}
            </p>

            {/* Pending Balance */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-900 block">Due Amount to Collect:</span>
              <span className="text-xl font-black text-rose-600">₹{deliveredModalOrder.pending_amount}</span>
            </div>

            {deliveredModalOrder.pending_amount > 0 && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount Collected from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={collectedAmount}
                    onChange={e => setCollectedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('upi_qr')}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        paymentMode === 'upi_qr' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('cash')}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        paymentMode === 'cash' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('card')}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        paymentMode === 'card' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeliveredModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelivery}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Confirm Delivered
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
