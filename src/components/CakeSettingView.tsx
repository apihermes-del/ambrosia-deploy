'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderItem } from '@/types';
import { 
  Cake, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  ChefHat, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CakeSettingView: React.FC = () => {
  const { orders, kitchens, pickupLocations, updateOrderStatus, updateItemStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'ready'>('active');
  const [selectedLocationModal, setSelectedLocationModal] = useState<{
    orderId: string;
    orderType: Order['order_type'];
  } | null>(null);
  const [chosenLocationId, setChosenLocationId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);

  React.useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const now = currentTime ? new Date(currentTime) : new Date(0);

  // Orders that are relevant to kitchen (new, preparing, ready_for_pickup)
  const kitchenOrders = orders.filter(o => 
    ['new', 'preparing', 'ready_for_pickup'].includes(o.status)
  );

  // Filter orders that are within their lead time window or overdue
  const activeLeadOrders = kitchenOrders.filter(order => {
    if (order.status === 'ready_for_pickup') return false;
    const target = new Date(order.target_delivery_time).getTime();
    // Default 2 hours if not specified
    const maxLeadMinutes = Math.max(...order.items.map(i => i.lead_time_minutes || 120), 120);
    const leadTimeMs = maxLeadMinutes * 60 * 1000;
    const activationTime = target - leadTimeMs;
    // Show if current time >= activation time OR if already manually moved to 'preparing'
    return now.getTime() >= activationTime || order.status === 'preparing';
  });

  const displayedOrders = activeTab === 'active' 
    ? activeLeadOrders 
    : activeTab === 'ready' 
    ? kitchenOrders.filter(o => o.status === 'ready_for_pickup')
    : kitchenOrders;

  const handleStartPreparing = (orderId: string, item: OrderItem, defaultKitchenId: string) => {
    updateItemStatus(orderId, item.id, 'preparing', defaultKitchenId);
    updateOrderStatus(orderId, 'preparing');
  };

  const handleItemReady = (orderId: string, itemId: string) => {
    // Simulated photo URL
    const demoPhotos = [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80',
    ];
    const randomPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
    updateItemStatus(orderId, itemId, 'ready', undefined, randomPhoto);
  };

  const openReadyModal = (order: Order) => {
    // Default location: If home delivery -> Cake Section Chiller. If outlet -> Outlet Chiller 1
    const defaultLoc = order.order_type === 'home_delivery'
      ? pickupLocations.find(l => l.category === 'cake_section')?.id || pickupLocations[0]?.id
      : pickupLocations.find(l => l.category === 'outlet_chiller')?.id || pickupLocations[1]?.id;

    setChosenLocationId(defaultLoc || '');
    setSelectedLocationModal({
      orderId: order.id,
      orderType: order.order_type,
    });
  };

  const confirmReadyForPickup = () => {
    if (!selectedLocationModal) return;
    updateOrderStatus(selectedLocationModal.orderId, 'ready_for_pickup', {
      pickup_location_id: chosenLocationId,
    });
    setSelectedLocationModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Cake Setting & Production Board
            <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Kitchen Display
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Orders appear automatically based on custom lead times before delivery. Assign kitchens and mark items ready.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 bg-amber-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Active Lead Window ({activeLeadOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            All Pending ({kitchenOrders.filter(o => o.status !== 'ready_for_pickup').length})
          </button>
          <button
            onClick={() => setActiveTab('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ready' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready in Chillers ({kitchenOrders.filter(o => o.status === 'ready_for_pickup').length})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No Orders in this Kitchen Queue</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Future orders will automatically light up here once their configured lead time window activates.
            </p>
          </div>
        ) : (
          displayedOrders.map(order => {
            const allItemsReady = order.items.every(i => i.status === 'ready');
            const targetTime = new Date(order.target_delivery_time);
            const minutesUntilDelivery = Math.round((targetTime.getTime() - now.getTime()) / 60000);

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border shadow-sm transition-all flex flex-col justify-between overflow-hidden ${
                  order.status === 'ready_for_pickup'
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : minutesUntilDelivery <= 60 
                    ? 'border-rose-400 ring-1 ring-rose-300'
                    : 'border-amber-200'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black tracking-wider text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded">
                      {order.tally_so_number}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      order.order_type === 'home_delivery' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.order_type === 'home_delivery' ? '🚚 Delivery' : '🏪 Outlet Pick up'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{order.customer_name}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {order.delivery_area}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${
                        minutesUntilDelivery < 0 ? 'text-red-600 animate-pulse' : minutesUntilDelivery <= 60 ? 'text-amber-700' : 'text-gray-700'
                      }`}>
                        {order.delivery_time_slot}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {minutesUntilDelivery < 0 ? 'Due Now!' : `In ~${minutesUntilDelivery} mins`}
                      </span>
                    </div>
                  </div>

                  {order.special_notes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-100/60 border border-amber-300/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span><strong>Special Note:</strong> {order.special_notes}</span>
                    </div>
                  )}
                </div>

                {/* Items & Kitchen Assignment */}
                <div className="p-4 space-y-4 flex-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Order Items ({order.items.length})
                  </span>

                  {order.items.map(item => {
                    const assignedKitchen = kitchens.find(k => k.id === item.kitchen_id);
                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          item.status === 'ready' 
                            ? 'bg-emerald-50/60 border-emerald-300' 
                            : item.status === 'preparing'
                            ? 'bg-amber-50/60 border-amber-300'
                            : 'bg-gray-50/70 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              {item.item_name}
                              <span className="text-[10px] font-semibold text-gray-500">
                                ({item.size_or_weight} • Qty: {item.quantity})
                              </span>
                            </div>
                            <span className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.2 rounded ${
                              item.egg_preference === 'eggless' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.egg_preference === 'eggless' ? '🌱 Eggless' : '🥚 With Egg'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.status === 'ready' ? 'bg-emerald-600 text-white' :
                            item.status === 'preparing' ? 'bg-amber-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Message On Cake */}
                        {item.cake_message && (
                          <div className="mt-2 p-2 rounded-lg bg-white border border-amber-300 shadow-2xs">
                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Message on Cake:</span>
                            <span className="text-xs font-serif font-bold text-gray-900 italic">
                              &ldquo;{item.cake_message}&rdquo;
                            </span>
                          </div>
                        )}

                        {/* Kitchen Selection & Action */}
                        <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-2">
                          <div className="w-full sm:w-auto">
                            <select
                              value={item.kitchen_id || ''}
                              onChange={e => updateItemStatus(order.id, item.id, item.status, e.target.value)}
                              className="w-full sm:w-auto text-[11px] font-medium py-1 px-2 rounded border border-gray-300 bg-white focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="">Select Prep Kitchen...</option>
                              {kitchens.map(k => (
                                <option key={k.id} value={k.id}>{k.name.split('-')[0]}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleStartPreparing(order.id, item, item.kitchen_id || kitchens[1].id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                              >
                                Start Prep
                              </button>
                            )}

                            {item.status === 'preparing' && (
                              <button
                                onClick={() => handleItemReady(order.id, item.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3" />
                                Photo & Mark Ready
                              </button>
                            )}

                            {item.status === 'ready' && item.photo_url && (
                              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                  {order.status === 'ready_for_pickup' ? (
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-800">
                          Stored at: {pickupLocations.find(l => l.id === order.pickup_location_id)?.name || 'Cake Section'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">Ready for Dispatch / Counter</span>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">
                        {allItemsReady ? '✨ All items prepared!' : 'In progress...'}
                      </span>
                      <button
                        onClick={() => openReadyModal(order)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                          allItemsReady 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        Ready for Pick up
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: Select Storage Location (Cake Section vs Outlet Chiller) */}
      {selectedLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-scale-up">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Where is this order being placed?
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {selectedLocationModal.orderType === 'home_delivery'
                ? 'This is a Home Delivery order. Store in Cake Section chiller for driver pickup.'
                : 'This is an Outlet Pick up order. Bring down to the outlet and place in a chiller.'}
            </p>

            <div className="mt-4 space-y-2">
              {pickupLocations.map(loc => (
                <label 
                  key={loc.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    chosenLocationId === loc.id 
                      ? 'border-amber-600 bg-amber-50 font-bold text-amber-950' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={loc.id}
                      checked={chosenLocationId === loc.id}
                      onChange={() => setChosenLocationId(loc.id)}
                      className="accent-amber-600"
                    />
                    <span className="text-xs">{loc.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize">
                    {loc.category.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLocationModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReadyForPickup}
                className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
              >
                Confirm & Mark Ready
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
