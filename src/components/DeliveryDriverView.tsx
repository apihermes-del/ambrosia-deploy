'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, PaymentMode } from '@/types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  IndianRupee, 
  Lock, 
  Unlock,
  AlertCircle
} from 'lucide-react';
import { getGoogleMapsNavigationUrl } from '@/lib/deliveryPricing';

export const DeliveryDriverView: React.FC = () => {
  const { 
    orders, 
    users, 
    currentUser, 
    updateOrderStatus, 
    markDelivered 
  } = useApp();

  const isDeliveryRole = currentUser.role === 'delivery';
  const [activeDriverId, setActiveDriverId] = useState<string>(isDeliveryRole ? currentUser.id : 'u5');
  
  // Delivery Completion Modal State
  const [deliveredModalOrder, setDeliveredModalOrder] = useState<Order | null>(null);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi_qr');

  const deliveryBoys = users.filter(u => u.role === 'delivery');

  // Orders assigned to selected driver
  const myAssignedOrders = orders.filter(
    o => o.order_type === 'home_delivery' && 
         o.assignment_type === 'driver' &&
         o.assigned_delivery_user_id === activeDriverId
  );

  const handleStartDelivery = (order: Order) => {
    updateOrderStatus(order.id, 'out_for_delivery', undefined, `Driver picked up order from Cake Section`);
  };

  const openDeliveredModal = (order: Order) => {
    setDeliveredModalOrder(order);
    if (order.payment_status === 'credit') {
      setCollectedAmount(0);
      setPaymentMode('none');
    } else {
      setCollectedAmount(order.pending_amount);
      setPaymentMode(order.pending_amount > 0 ? 'cash' : 'none');
    }
  };

  const handleConfirmDelivery = () => {
    if (!deliveredModalOrder) return;
    markDelivered(deliveredModalOrder.id, collectedAmount, paymentMode);
    setDeliveredModalOrder(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Mobile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Driver Delivery Run</h1>
            <p className="text-xs text-gray-500">Pick up from Cake Section & record doorstep collections</p>
          </div>
        </div>

        {/* Driver Selector for simulation */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Active Driver:</span>
          <select
            value={activeDriverId}
            onChange={e => setActiveDriverId(e.target.value)}
            className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-300 bg-white"
          >
            {deliveryBoys.map(d => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards for Assigned Orders */}
      <div className="space-y-4">
        {myAssignedOrders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-700">No Orders Currently Assigned</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
              The Delivery Lead or Customer Care will allocate upcoming trips to you from the dispatch board.
            </p>
          </div>
        ) : (
          myAssignedOrders.map(order => {
            const isDispatched = order.status === 'out_for_delivery';
            const isDelivered = order.status === 'delivered';
            const isCreditOrder = order.payment_status === 'credit';

            // REFINEMENT 10: Accurate Google Maps direction link with origin as Bakery Junction, Trivandrum
            const mapsNavUrl = getGoogleMapsNavigationUrl(
              order.delivery_address || '',
              order.delivery_area,
              order.delivery_landmark
            );

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
                  isDelivered 
                    ? 'border-gray-200 bg-gray-50/50 opacity-75' 
                    : isDispatched 
                    ? 'border-blue-400 ring-2 ring-blue-300' 
                    : 'border-amber-300'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/30 to-blue-50/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded">
                      {order.tally_so_number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isDelivered ? 'bg-emerald-100 text-emerald-800' :
                      isDispatched ? 'bg-blue-600 text-white animate-pulse' :
                      'bg-amber-200 text-amber-900'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
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

                {/* Items */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Pick up Items:
                    </span>
                    {order.items.map(item => (
                      <div key={item.id} className="text-xs font-semibold text-gray-800">
                        • {item.item_name} ({item.size_or_weight} • Qty: {item.quantity})
                      </div>
                    ))}
                  </div>

                  {/* Payment Alert */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isCreditOrder 
                      ? 'bg-purple-50 border-purple-200 text-purple-950'
                      : order.pending_amount > 0 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <IndianRupee className="w-4 h-4" />
                      <span>
                        {isCreditOrder 
                          ? 'Corporate Credit (DO NOT COLLECT CASH)' 
                          : order.pending_amount > 0 
                          ? 'Collect Cash/UPI Balance:' 
                          : 'Paid in Advance'}
                      </span>
                    </div>
                    <span className="text-sm font-black">
                      {isCreditOrder ? '₹0.00' : `₹${order.pending_amount}`}
                    </span>
                  </div>

                  {/* Privacy Masked Address until "Out for Delivery" */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    {!isDispatched && !isDelivered ? (
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-gray-900">Address & Contact Protected</div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Pick up cake from <strong>Cake Section Chiller</strong> and tap <strong>&ldquo;Out for Delivery&rdquo;</strong> to unlock house number, customer phone, and GPS turn-by-turn navigation.
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
                            href={mapsNavUrl}
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

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  {isDelivered ? (
                    <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered Successfully
                      </span>
                      <span className="text-gray-500 text-[11px] font-medium">
                        Collected: ₹{order.delivery_payment_collected} via {order.delivery_payment_mode?.toUpperCase()}
                      </span>
                    </div>
                  ) : !isDispatched ? (
                    <button
                      onClick={() => handleStartDelivery(order)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Truck className="w-4 h-4" />
                      Picked from Cake Section & Start Trip
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

      {/* Payment Handover Modal */}
      {deliveredModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-emerald-300">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Complete Doorstep Handover
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Order: <strong className="font-mono">{deliveredModalOrder.tally_so_number}</strong> for {deliveredModalOrder.customer_name}
            </p>

            {deliveredModalOrder.payment_status === 'credit' ? (
              <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-bold">
                ✓ Credit Customer - No cash/payment to collect.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-900 font-semibold block">Pending Balance Due:</span>
                  <span className="text-lg font-black text-rose-600">₹{deliveredModalOrder.pending_amount}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount Collected from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={collectedAmount}
                    onChange={e => setCollectedAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg font-bold"
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
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
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
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
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
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
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

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeliveredModalOrder(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelivery}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
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
