'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Order, AssignmentType } from '@/types';
import { 
  Navigation, 
  UserCheck, 
  Calendar, 
  Truck, 
  Car, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  AlertCircle,
  IndianRupee,
  ChevronRight
} from 'lucide-react';

export const DeliveryLeadView: React.FC = () => {
  const { 
    orders, 
    users, 
    onDutyDrivers, 
    toggleDriverDuty, 
    assignVehicleOrDriver, 
    currentUser 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const isAuthorized = ['super_admin', 'delivery_lead', 'customer_care'].includes(currentUser.role);

  // Delivery boys
  const deliveryBoys = users.filter(u => u.role === 'delivery');
  const onDutyDeliveryBoys = deliveryBoys.filter(u => onDutyDrivers.includes(u.id));

  // Orders for chosen date
  const dateHomeOrders = orders.filter(o => 
    o.order_type === 'home_delivery' && 
    o.delivery_date === selectedDate &&
    o.status !== 'cancelled'
  );

  // Tomorrow date string for advance 4-wheeler planning
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const isTomorrowView = selectedDate === tomorrowStr;

  const handleCopyFourWheelerText = (order: Order) => {
    const formattedDate = new Date(order.delivery_date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const itemsList = order.items.map(i => `${i.item_name} (${i.size_or_weight} - Qty: ${i.quantity})`).join(', ');
    const balanceText = order.payment_status === 'credit'
      ? 'Credit Account (Do not collect cash)'
      : order.pending_amount > 0 
      ? `₹${order.pending_amount}` 
      : '₹0 (Paid in full)';

    const textToCopy = `4-Wheeler required on ${formattedDate} for delivery at ${order.delivery_time_slot} to ${order.delivery_area} (${order.customer_name}) for ${itemsList}. Balance payment of ${balanceText} to be collected on delivery.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 3000);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-2">
            Only Delivery Lead, Customer Care, and Super Admin can manage vehicle allotments and driver rosters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Delivery Lead Dispatch Board
            <span className="text-xs bg-amber-600 text-white font-sans font-semibold px-2 py-0.5 rounded-full">
              Fleet & Allotment
            </span>
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Roster on-duty riders, allocate Porter/Uber, and schedule 4-wheelers in advance for large wedding/tier cakes.
          </p>
        </div>

        {/* Date Selector for inspecting today, tomorrow & future days */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
              isTomorrowView
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Tomorrow (4-Wheeler Prep)
          </button>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="outline-none text-xs font-bold text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Advance 4-Wheeler Planning Notice */}
      {isTomorrowView && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Advance Day Planning:</strong> Inspecting deliveries for tomorrow. Allot fragile or tiered cakes to <strong>&ldquo;4-Wheeler&rdquo;</strong> now and copy the WhatsApp dispatch message for your cab group.
            </span>
          </div>
          <span className="font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
            {dateHomeOrders.filter(o => o.assignment_type === 'four_wheeler').length} 4-Wheelers Scheduled
          </span>
        </div>
      )}

      {/* Duty Roster Row */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Daily Attendance Roster ({onDutyDrivers.length} on duty)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500">Tap to toggle driver on/off duty</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
          {deliveryBoys.map(driver => {
            const isOnDuty = onDutyDrivers.includes(driver.id);
            const assignedOrdersCount = orders.filter(
              o => o.assigned_delivery_user_id === driver.id && o.delivery_date === selectedDate
            ).length;

            return (
              <button
                key={driver.id}
                onClick={() => toggleDriverDuty(driver.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isOnDuty 
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-gray-900">{driver.full_name}</div>
                  <div className="text-[10px] text-gray-500">{driver.phone_number}</div>
                  <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                    {assignedOrdersCount} orders assigned
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isOnDuty ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {isOnDuty ? 'ON DUTY' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Dispatch Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Home Deliveries for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <span className="text-xs text-gray-500">
              {dateHomeOrders.length} Deliveries scheduled
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">SO #</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Customer & Trivandrum Area</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment Due</th>
                <th className="py-3 px-4">Vehicle / Driver Allotment</th>
                <th className="py-3 px-4">4-Wheeler WhatsApp Template</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dateHomeOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No home deliveries scheduled for {selectedDate}.
                  </td>
                </tr>
              ) : (
                dateHomeOrders.map(order => {
                  const isFourWheeler = order.assignment_type === 'four_wheeler';
                  const isPorter = order.assignment_type === 'porter_uber';
                  const isDriver = order.assignment_type === 'driver';

                  return (
                    <tr key={order.id} className="hover:bg-amber-50/20">
                      <td className="py-3 px-4 font-mono font-bold text-amber-950">
                        {order.tally_so_number}
                        {order.is_edited_flag && (
                          <span className="block text-[9px] text-red-600 font-bold">EDITED</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">
                        {order.delivery_time_slot}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{order.customer_name}</div>
                        <div className="text-[11px] text-amber-800 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {order.delivery_area}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          {order.items.map(i => (
                            <div key={i.id} className="text-gray-700 truncate">
                              • {i.item_name} ({i.size_or_weight})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {order.payment_status === 'credit' ? (
                          <span className="text-purple-700">CREDIT ORDER</span>
                        ) : order.pending_amount > 0 ? (
                          <span className="text-rose-600">₹{order.pending_amount} DUE</span>
                        ) : (
                          <span className="text-emerald-600">PAID</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          {/* Assignment Type Selector */}
                          <select
                            value={order.assignment_type}
                            onChange={e => {
                              const newType = e.target.value as AssignmentType;
                              if (newType === 'driver') {
                                assignVehicleOrDriver(order.id, 'driver', onDutyDeliveryBoys[0]?.id);
                              } else {
                                assignVehicleOrDriver(order.id, newType);
                              }
                            }}
                            className="w-full text-xs font-semibold py-1 px-2 rounded-lg border border-gray-300 bg-white"
                          >
                            <option value="unassigned">-- Unassigned --</option>
                            <option value="driver">🛵 Bike Rider (In-house)</option>
                            <option value="four_wheeler">🚙 4-Wheeler AC Cab</option>
                            <option value="porter_uber">📦 Porter / Uber</option>
                          </select>

                          {/* If Driver is selected, choose specific driver */}
                          {isDriver && (
                            <select
                              value={order.assigned_delivery_user_id || ''}
                              onChange={e => assignVehicleOrDriver(order.id, 'driver', e.target.value)}
                              className="w-full text-xs py-1 px-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 font-bold"
                            >
                              <option value="">Choose On-Duty Rider...</option>
                              {onDutyDeliveryBoys.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                              ))}
                            </select>
                          )}

                          {/* If Porter/Uber is selected */}
                          {isPorter && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold block">
                              Third party booking (Peak hour overflow)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isFourWheeler ? (
                          <div>
                            <button
                              onClick={() => handleCopyFourWheelerText(order)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors"
                            >
                              {copiedOrderId === order.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-300" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy WhatsApp Note
                                </>
                              )}
                            </button>
                            <span className="text-[9px] text-gray-500 block mt-1">
                              Pre-formatted dispatch text for cab driver
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
