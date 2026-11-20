'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, OrderItem } from '@/types';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ChefHat, 
  RotateCcw,
  AlertTriangle,
  Play,
  Image as ImageIcon,
  X
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
  const [viewingRefImage, setViewingRefImage] = useState<{ url: string; title: string } | null>(null);

  const isAuthorized = ['super_admin', 'cake_setting', 'customer_care'].includes(currentUser.role);

  React.useEffect(() => {
    setCurrentTime(Date.now());
    const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const now = currentTime ? new Date(currentTime) : new Date(0);

  const kitchenOrders = orders.filter(o => 
    ['new', 'preparing', 'ready_for_pickup'].includes(o.status)
  );

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

  const handleBlanketStartPrep = (order: Order) => {
    if (!isAuthorized) return;
    order.items.forEach(itm => {
      updateItemStatus(order.id, itm.id, 'preparing');
    });
    updateOrderStatus(order.id, 'preparing', undefined, 'Entire order moved to Preparing');
  };

  const handleRevertToPreparing = (order: Order) => {
    if (!isAuthorized) return;
    const confirmRevert = confirm(`Move ${order.tally_so_number} back to "Preparing" for adjustments?`);
    if (confirmRevert) {
      order.items.forEach(itm => {
        updateItemStatus(order.id, itm.id, 'preparing');
      });
      updateOrderStatus(order.id, 'preparing', { pickup_location_id: undefined }, 'Reverted back to Preparing');
    }
  };

  const openReadyModal = (order: Order) => {
    if (!isAuthorized) return;
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
    
    const targetOrder = orders.find(o => o.id === selectedLocationModal.orderId);
    if (targetOrder) {
      targetOrder.items.forEach(itm => {
        updateItemStatus(targetOrder.id, itm.id, 'ready');
      });
    }

    updateOrderStatus(selectedLocationModal.orderId, 'ready_for_pickup', {
      pickup_location_id: chosenLocationId,
    }, `Placed in ${locName}`);
    setSelectedLocationModal(null);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-8 apple-card max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#1D1D1F]">Access Restricted</h2>
          <p className="text-xs text-[#86868B] mt-1.5">
            Logged in as {currentUser.full_name}. Delivery staff accounts do not have permission to modify Kitchen stages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Apple-style Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            Cake Setting & Kitchen
            <span className="text-[11px] bg-black/[0.06] text-[#424245] font-mono px-2 py-0.5 rounded-md font-medium">
              Queue
            </span>
          </h1>
          <p className="text-xs text-[#86868B] mt-0.5">
            Live orders sorted by lead time. High-contrast inscription boxes highlight exact text to pipe.
          </p>
        </div>

        {/* Minimal Segmented Filters */}
        <div className="flex items-center bg-[#E8E8ED]/70 p-1 rounded-xl border border-black/[0.04]">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'active' 
                ? 'bg-white text-black shadow-xs font-semibold' 
                : 'text-[#6E6E73] hover:text-black font-medium'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Lead Window ({activeLeadOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeTab === 'all' 
                ? 'bg-white text-black shadow-xs font-semibold' 
                : 'text-[#6E6E73] hover:text-black font-medium'
            }`}
          >
            Pending ({kitchenOrders.filter(o => o.status !== 'ready_for_pickup').length})
          </button>
          <button
            onClick={() => setActiveTab('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
              activeTab === 'ready' 
                ? 'bg-white text-black shadow-xs font-semibold' 
                : 'text-[#6E6E73] hover:text-black font-medium'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            In Chillers ({kitchenOrders.filter(o => o.status === 'ready_for_pickup').length})
          </button>
        </div>
      </div>

      {/* Modern Minimalist Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center apple-card border-dashed">
            <ChefHat className="w-9 h-9 text-[#86868B] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-[#1D1D1F]">No Orders in Queue</h3>
            <p className="text-xs text-[#86868B] max-w-xs mx-auto mt-0.5">
              Future bookings will appear here automatically when their lead time opens.
            </p>
          </div>
        ) : (
          displayedOrders.map(order => {
            const targetTime = new Date(order.target_delivery_time);
            const minutesUntilDelivery = Math.round((targetTime.getTime() - now.getTime()) / 60000);
            const isReadyForPickup = order.status === 'ready_for_pickup';
            const isPreparing = order.status === 'preparing';
            const isNew = order.status === 'new';
            const referenceImage = order.reference_image_url || order.items.find(i => i.reference_image_url)?.reference_image_url;

            return (
              <div 
                key={order.id} 
                className={`apple-card apple-card-hover flex flex-col justify-between overflow-hidden ${
                  isReadyForPickup
                    ? 'border-emerald-500/30'
                    : isPreparing
                    ? 'border-[#0071E3]/30'
                    : minutesUntilDelivery <= 60 
                    ? 'border-rose-500/40' 
                    : ''
                }`}
              >
                {/* Card Top Section */}
                <div className="p-3.5 border-b border-black/[0.05] bg-[#FBFBFD]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-[#1D1D1F] bg-black/[0.05] px-2 py-0.5 rounded-md">
                        {order.tally_so_number}
                      </span>
                      {order.is_edited_flag && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded border border-rose-200">
                          EDITED
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      order.order_type === 'home_delivery' 
                        ? 'bg-[#0071E3]/10 text-[#0071E3]' 
                        : 'bg-purple-500/10 text-purple-700'
                    }`}>
                      {order.order_type === 'home_delivery' ? 'Home Delivery' : 'Outlet Pickup'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <span className="text-xs font-semibold text-[#1D1D1F] truncate max-w-[150px]">
                      {order.customer_name}
                    </span>
                    <span className={`text-xs font-mono font-semibold ${
                      minutesUntilDelivery < 0 ? 'text-rose-600' : minutesUntilDelivery <= 60 ? 'text-amber-600' : 'text-[#6E6E73]'
                    }`}>
                      {order.delivery_time_slot}
                    </span>
                  </div>

                  {order.special_notes && (
                    <div className="mt-2 text-[11px] text-[#424245] bg-[#F5F5F7] p-2 rounded-lg border border-black/[0.04] leading-relaxed">
                      <strong className="text-black">Note:</strong> {order.special_notes}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2.5 flex-1 bg-white">
                  
                  {/* Reference Design Image Badge */}
                  {referenceImage && (
                    <div className="p-2 rounded-xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div 
                          onClick={() => setViewingRefImage({ url: referenceImage, title: `${order.tally_so_number} Reference Model` })}
                          className="w-9 h-9 rounded-lg overflow-hidden border border-black/[0.08] cursor-pointer flex-shrink-0"
                        >
                          <img 
                            src={referenceImage} 
                            alt="Reference" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="text-[11px] leading-tight">
                          <span className="font-semibold text-[#1D1D1F] block">Design Attached</span>
                          <span className="text-[10px] text-[#86868B]">Tap to enlarge model</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingRefImage({ url: referenceImage, title: `${order.tally_so_number} Reference Model` })}
                        className="px-2 py-1 text-[10px] font-medium bg-black text-white rounded-md hover:bg-black/80 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  )}

                  {/* Items */}
                  {order.items.map(item => (
                    <div 
                      key={item.id} 
                      className="p-2.5 rounded-xl border border-black/[0.06] bg-[#FAFAFC] text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-mono text-[#86868B] block">Product</span>
                          <span className="font-semibold text-[#1D1D1F] text-xs">
                            {item.item_name}
                          </span>
                        </div>
                        <span className="text-[10px] bg-black/[0.04] text-[#424245] font-mono font-medium px-2 py-0.5 rounded-md">
                          {item.size_or_weight} • Qty: {item.quantity}
                        </span>
                      </div>

                      {/* HIGH-CONTRAST GOLDEN CAKE INSCRIPTION */}
                      {item.cake_message && (
                        <div className="py-2 px-2.5 rounded-lg bg-[#FFD60A] border border-[#E5C000] text-[#1D1D1F] shadow-2xs">
                          <div className="text-xs font-serif font-black tracking-wide leading-tight">
                            &ldquo;{item.cake_message}&rdquo;
                          </div>
                        </div>
                      )}

                      {item.special_instructions && (
                        <div className="text-[10px] text-[#86868B] italic">
                          Design: {item.special_instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Minimal Action Footer */}
                <div className="p-3 border-t border-black/[0.05] bg-[#FBFBFD] flex items-center justify-between">
                  {isNew ? (
                    <button
                      onClick={() => handleBlanketStartPrep(order)}
                      className="w-full py-2 bg-black hover:bg-black/80 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Prep
                    </button>
                  ) : isPreparing ? (
                    <button
                      onClick={() => openReadyModal(order)}
                      className="w-full py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready for Pick up
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          {pickupLocations.find(l => l.id === order.pickup_location_id)?.name || 'Chiller'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleRevertToPreparing(order)}
                        className="px-2.5 py-1 text-[10px] font-medium text-[#424245] bg-[#E8E8ED] hover:bg-[#DCDCE2] rounded-lg border border-black/[0.04] flex items-center gap-1 transition-colors"
                        title="Move back to Preparing"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Revert
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {viewingRefImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-black/[0.08] animate-scale-up">
            <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1D1D1F]">
                {viewingRefImage.title}
              </span>
              <button
                onClick={() => setViewingRefImage(null)}
                className="p-1 rounded-full text-[#86868B] hover:text-black hover:bg-black/[0.04]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-[75vh] overflow-auto flex items-center justify-center bg-[#F5F5F7]">
              <img 
                src={viewingRefImage.url} 
                alt="Cake Reference" 
                className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-sm" 
              />
            </div>
            <div className="p-3.5 bg-white border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868B]">
              <span>Customer reference design</span>
              <button
                onClick={() => setViewingRefImage(null)}
                className="px-3 py-1.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-black rounded-lg font-medium text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {selectedLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/[0.08]">
            <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0071E3]" />
              Assign Chiller Storage
            </h3>
            <p className="text-xs text-[#86868B] mt-1">
              Select where this order is being stored.
            </p>

            <div className="mt-4 space-y-2">
              {pickupLocations.map(loc => (
                <label 
                  key={loc.id} 
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                    chosenLocationId === loc.id 
                      ? 'border-[#0071E3] bg-[#0071E3]/[0.06] font-semibold text-[#0071E3]' 
                      : 'border-black/[0.08] hover:bg-[#F5F5F7] text-[#1D1D1F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={loc.id}
                      checked={chosenLocationId === loc.id}
                      onChange={() => setChosenLocationId(loc.id)}
                      className="accent-[#0071E3]"
                    />
                    <span>{loc.name}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLocationModal(null)}
                className="px-3.5 py-1.5 text-xs text-[#86868B] hover:text-black rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReadyForPickup}
                className="px-4 py-1.5 text-xs font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
