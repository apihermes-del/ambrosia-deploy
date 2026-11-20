'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Store, CheckCircle2, Search, MapPin, IndianRupee, Sparkles, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OutletPickupView: React.FC = () => {
  const { orders, pickupLocations, markCollected, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Outlet pickup orders
  const outletOrders = orders.filter(o => o.order_type === 'outlet_pickup');

  // Filter based on search query
  const filteredOrders = outletOrders.filter(order => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      order.tally_so_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q)
    );
  });

  const readyOrders = filteredOrders.filter(o => o.status === 'ready_for_pickup');
  const preparingOrders = filteredOrders.filter(o => ['new', 'preparing'].includes(o.status));
  const collectedOrders = filteredOrders.filter(o => o.status === 'collected');

  const handleHandover = (orderId: string) => {
    markCollected(orderId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Outlet Counter & Chiller Handover
            <span className="text-xs bg-purple-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Counter Staff & Cake Setting Team
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Orders brought down to the outlet chillers. Verify order with customer and 1-tap mark as &ldquo;Order Collected / Handed Over&rdquo;.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SO #, Name, Phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl bg-white shadow-2xs focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Main Section: Ready for Customer Handover */}
      <div className="mt-6 space-y-6">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Ready for Customer Pick up ({readyOrders.length})
            </h2>
            <span className="text-xs text-gray-500 font-medium">In Outlet Chillers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyOrders.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-gray-600">No Cakes Currently Waiting in Outlet Chillers</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
                  When the cake setting team brings an order to the outlet chillers, it will appear here.
                </p>
              </div>
            ) : (
              readyOrders.map(order => {
                const chiller = pickupLocations.find(l => l.id === order.pickup_location_id);
                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-2xl border-2 border-purple-300 shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-purple-950 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-300">
                          {order.tally_so_number}
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          Slot: {order.delivery_time_slot}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-base font-bold text-gray-900">{order.customer_name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">📞 {order.customer_phone}</p>
                      </div>

                      {/* Chiller Location Badge */}
                      <div className="mt-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 uppercase block">Chiller Location:</span>
                          <span className="text-xs font-bold">{chiller?.name || 'Outlet Chiller 1'}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Items:</span>
                        {order.items.map(item => (
                          <div key={item.id} className="text-xs font-semibold text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div>• {item.item_name} ({item.size_or_weight} • Qty: {item.quantity})</div>
                            {item.cake_message && (
                              <div className="text-[11px] text-amber-900 font-serif italic mt-0.5">
                                Inscription: &ldquo;{item.cake_message}&rdquo;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Payment */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Balance Due:</span>
                        <span className={`font-black ${order.pending_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {order.pending_amount > 0 ? `₹${order.pending_amount} DUE` : 'Fully Paid'}
                        </span>
                      </div>
                    </div>

                    {/* 1-Tap Handover Button */}
                    <div className="mt-5 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleHandover(order.id)}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Order Collected / Handed Over
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* In Kitchen Preparation */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            Still Preparing in Kitchen ({preparingOrders.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {preparingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-700">{order.tally_so_number}</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="font-bold text-gray-900 mt-2">{order.customer_name}</div>
                <div className="text-gray-500 mt-0.5">Slot: {order.delivery_time_slot}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Collected */}
        {collectedOrders.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 mb-3">
              Completed Handover Today ({collectedOrders.length})
            </h2>
            <div className="space-y-2">
              {collectedOrders.slice(0, 3).map(order => (
                <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-gray-800">{order.tally_so_number}</span>
                      <span className="text-gray-600 ml-2">{order.customer_name}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Collected & Closed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
