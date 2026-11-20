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
  RotateCcw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const CakeSettingView: React.FC = () => {
  const { orders, pickupLocations, updateOrderStatus, updateItemStatus, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'ready'>('active');
  const [selectedLocationModal, setSelectedLocationModal] = useState<{
    orderId: string;
    orderType: Order['order_type'];
  } | null>(null);
  const [chosenLocationId, setChosenLocationId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Role Protection: Delivery boys cannot control kitchen
  const isAuthorized = ['super_admin', 'cake_setting', 'customer_care'].includes(currentUser.role);

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

  // Filter orders within lead time window or preparing
  const activeLeadOrders = kitchenOrders.filter(order => {
    if (order.status === 'ready_for_pickup') return false;
    const target = new Date(order.target_delivery_time).getTime();
    const maxLeadMinutes = Math.max(...order.items.map(i => i.lead_time_minutes || 120), 120);
    const leadTimeMs = maxLeadMinutes * 60 * 1000;
    const activationTime = target - leadTimeMs;
    return now.getTime() >= activationTime || order.status === 'preparing';
  });

  const displayedOrders = activeTab === 'active' 
    ? activeLeadOrders 
    : activeTab === 'ready' 
    ? kitchenOrders.filter(o => o.status === 'ready_for_pickup')
    : kitchenOrders;

  const handleStartPreparing = (orderId: string, item: OrderItem) => {
    if (!isAuthorized) {
      alert('Unauthorized: Only Cake Setting and Customer Care can modify kitchen stages.');
      return;
    }
    updateItemStatus(orderId, item.id, 'preparing');
    updateOrderStatus(orderId, 'preparing', undefined, 'Cake setting started preparation');
  };

  const handleItemReady = (orderId: string, itemId: string) => {
    if (!isAuthorized) {
      alert('Unauthorized: Only Cake Setting and Customer Care can modify kitchen stages.');
      return;
    }
    const demoPhotos = [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80',
    ];
    const randomPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
    updateItemStatus(orderId, itemId, 'ready', undefined, randomPhoto);
  };

  // REFINEMENT 6: Move Ready for Pick up back to Preparing
  const handleRevertToPreparing = (order: Order) => {
    if (!isAuthorized) {
      alert('Unauthorized: Only Cake Setting and Customer Care can modify kitchen stages.');
      return;
    }
    const confirmRevert = confirm(`Move ${order.tally_so_number} back to "Preparing" for adjustments?`);
    if (confirmRevert) {
      // Set all items back to preparing
      order.items.forEach(itm => {
        updateItemStatus(order.id, itm.id, 'preparing');
      });
      updateOrderStatus(order.id, 'preparing', { pickup_location_id: undefined }, 'Reverted from Ready for Pick up back to Preparing');
    }
  };

  const openReadyModal = (order: Order) => {
    if (!isAuthorized) {
      alert('Unauthorized: Delivery staff cannot change kitchen readiness.');
      return;
    }
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
    const locName = pickupLocations.find(l => l.id === chosenLocationId)?.name || 'Chiller';
    updateOrderStatus(selectedLocationModal.orderId, 'ready_for_pickup', {
      pickup_location_id: chosenLocationId,
    }, `Placed in ${locName}`);
    setSelectedLocationModal(null);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-2">
            Logged in as <strong>{currentUser.full_name} ({currentUser.role.replace('_', ' ')})</strong>.
            Delivery boys do not have permission to modify Cake Setting & Kitchen boards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Cake Setting & Production Board
            <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2 py-0.5 rounded-full">
              Compact Kitchen View
            </span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Real-time queue sorted by lead time. Streamlined compact cards to monitor high-volume orders simultaneously.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-amber-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-amber-900 hover:bg-amber-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lead Window ({activeLeadOrders.length})
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
            In Chillers ({kitchenOrders.filter(o => o.status === 'ready_for_pickup').length})
          </button>
        </div>
      </div>

      {/* Compact Cards Grid (Refinement 3: reduced clutter, removed prep kitchen dropdown) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <ChefHat className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-700">No Orders Currently in Lead Window</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
              Future orders will automatically light up here once their configured lead time window activates.
            </p>
          </div>
        ) : (
          displayedOrders.map(order => {
            const allItemsReady = order.items.every(i => i.status === 'ready');
            const targetTime = new Date(order.target_delivery_time);
            const minutesUntilDelivery = Math.round((targetTime.getTime() - now.getTime()) / 60000);
            const isReadyForPickup = order.status === 'ready_for_pickup';

            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-xl border shadow-xs transition-all flex flex-col justify-between overflow-hidden ${
                  isReadyForPickup
                    ? 'border-emerald-300 bg-emerald-50/15'
                    : minutesUntilDelivery <= 60 
                    ? 'border-rose-400 ring-1 ring-rose-200'
                    : 'border-amber-200 hover:border-amber-300'
                }`}
              >
                {/* Compact Header */}
                <div className="p-3 border-b border-gray-100 bg-amber-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">
                        {order.tally_so_number}
                      </span>
                      {order.is_edited_flag && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-black px-1.5 py-0.5 rounded border border-red-300 animate-pulse flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> EDITED
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      order.order_type === 'home_delivery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.order_type === 'home_delivery' ? '🚚 Delivery' : '🏪 Outlet'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[140px]">
                      {order.customer_name}
                    </span>
                    <span className={`text-xs font-bold ${
                      minutesUntilDelivery < 0 ? 'text-red-600 animate-pulse' : minutesUntilDelivery <= 60 ? 'text-rose-600' : 'text-gray-700'
                    }`}>
                      {order.delivery_time_slot}
                    </span>
                  </div>

                  {order.special_notes && (
                    <div className="mt-1.5 text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded border border-amber-300/60 leading-tight">
                      <strong>Note:</strong> {order.special_notes}
                    </div>
                  )}
                </div>

                {/* Compact Items List */}
                <div className="p-3 space-y-2 flex-1">
                  {order.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-2 rounded-lg border text-xs ${
                        item.status === 'ready' 
                          ? 'bg-emerald-50/60 border-emerald-300' 
                          : item.status === 'preparing'
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-gray-900 leading-tight">
                          {item.item_name}
                          <span className="text-[10px] text-gray-500 font-medium block">
                            {item.size_or_weight} • Qty: {item.quantity}
                          </span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.status === 'ready' ? 'bg-emerald-600 text-white' :
                          item.status === 'preparing' ? 'bg-amber-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {item.cake_message && (
                        <div className="mt-1.5 p-1 rounded bg-white border border-amber-200 text-[11px] font-serif text-amber-950 font-semibold italic">
                          &ldquo;{item.cake_message}&rdquo;
                        </div>
                      )}

                      {/* Item Actions */}
                      <div className="mt-2 flex items-center justify-end gap-1.5">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleStartPreparing(order.id, item)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
                          >
                            Start Prep
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            onClick={() => handleItemReady(order.id, item.id)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-1"
                          >
                            <Camera className="w-2.5 h-2.5" /> Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Action Footer */}
                <div className="p-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  {isReadyForPickup ? (
                    <div className="w-full flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          {pickupLocations.find(l => l.id === order.pickup_location_id)?.name || 'Chiller'}
                        </span>
                      </div>
                      
                      {/* REFINEMENT 6: Move stage back to preparing */}
                      <button
                        onClick={() => handleRevertToPreparing(order)}
                        className="px-2 py-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 flex items-center gap-1 transition-colors"
                        title="Move back to Preparing"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Revert
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {allItemsReady ? '✨ Ready for chiller' : 'In prep'}
                      </span>
                      <button
                        onClick={() => openReadyModal(order)}
                        className="px-3 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
                      >
                        Ready for Pick up
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Location Chiller Modal */}
      {selectedLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-amber-200">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              Select Chiller Storage Location
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              {selectedLocationModal.orderType === 'home_delivery'
                ? 'Store in Cake Section Chiller for delivery driver pickup.'
                : 'Bring down to the outlet and place in one of the outlet chillers.'}
            </p>

            <div className="mt-3 space-y-2">
              {pickupLocations.map(loc => (
                <label 
                  key={loc.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs ${
                    chosenLocationId === loc.id 
                      ? 'border-amber-600 bg-amber-50 font-bold text-amber-950' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={loc.id}
                      checked={chosenLocationId === loc.id}
                      onChange={() => setChosenLocationId(loc.id)}
                      className="accent-amber-600"
                    />
                    <span>{loc.name}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLocationModal(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReadyForPickup}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
