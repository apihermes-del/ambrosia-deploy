'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Navigation, 
  UserCheck, 
  Calendar, 
  Car, 
  Copy, 
  Check, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import { AssignmentType, Order } from '@/types';

export const DeliveryLeadView: React.FC = () => {
  const { 
    orders, 
    users, 
    getOnDutyDriversForDate, 
    toggleDriverDuty, 
    assignVehicleOrDriver, 
    currentUser 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const isAuthorized = ['super_admin', 'delivery_lead', 'customer_care'].includes(currentUser.role);
  const deliveryBoys = users.filter(u => u.role === 'delivery');
  
  const onDutyDriverIdsForDate = getOnDutyDriversForDate(selectedDate);
  const onDutyDeliveryBoys = deliveryBoys.filter(u => onDutyDriverIdsForDate.includes(u.id));

  const dateHomeOrders = orders.filter(o => 
    o.order_type === 'home_delivery' && 
    o.delivery_date === selectedDate &&
    o.status !== 'cancelled'
  );

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const isTomorrowView = selectedDate === tomorrowStr;

  const unassignedTodayOrders = orders.filter(o => 
    o.order_type === 'home_delivery' && 
    o.delivery_date === todayStr &&
    !['delivered', 'cancelled'].includes(o.status) &&
    (o.assignment_type === 'unassigned' || !o.assigned_delivery_user_id)
  );

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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-8 apple-card max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-[#1D1D1F]">Access Restricted</h2>
          <p className="text-xs text-[#86868B] mt-1.5">
            Only Delivery Lead, Customer Care, and Super Admin can manage vehicle allotments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            Delivery Assignment
            <span className="text-[11px] bg-black/[0.06] text-[#424245] font-mono px-2 py-0.5 rounded-md font-medium">
              Fleet
            </span>
          </h1>
          <p className="text-xs text-[#86868B] mt-0.5">
            Schedule on-duty riders, allocate Porter/Uber, and reserve 4-wheelers in advance for wedding cakes.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              selectedDate === todayStr
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-[#1D1D1F] border-black/[0.08] hover:bg-[#F5F5F7]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
              isTomorrowView
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-white text-[#1D1D1F] border-black/[0.08] hover:bg-[#F5F5F7]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Tomorrow (4-Wheeler Prep)
          </button>
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.08] px-2.5 py-1.5 rounded-xl text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#86868B]" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="outline-none text-xs font-semibold text-[#1D1D1F] bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {unassignedTodayOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#1D1D1F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-900">
                {unassignedTodayOrders.length} Unassigned Deliveries for Today
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Orders need driver or vehicle allotment.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            Review Today ({unassignedTodayOrders.length})
          </button>
        </div>
      )}

      {/* Advance 4-Wheeler Alert */}
      {isTomorrowView && (
        <div className="p-4 rounded-2xl bg-[#0071E3]/[0.06] border border-[#0071E3]/20 text-[#1D1D1F] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0071E3] flex-shrink-0" />
            <span>
              <strong>Advance Planning for Tomorrow:</strong> Assign heavy or tiered cakes to <strong>4-Wheeler</strong> and copy the WhatsApp dispatch message for the cab group.
            </span>
          </div>
          <span className="font-mono text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full">
            {dateHomeOrders.filter(o => o.assignment_type === 'four_wheeler').length} Scheduled
          </span>
        </div>
      )}

      {/* Duty Roster Row */}
      <div className="apple-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-black/[0.05] pb-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0071E3]" />
            <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
              Attendance Roster for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} ({onDutyDeliveryBoys.length} on duty)
            </h3>
          </div>
          <span className="text-[11px] text-[#86868B]">Tap rider card to toggle shift</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {deliveryBoys.map(driver => {
            const isOnDuty = onDutyDriverIdsForDate.includes(driver.id);
            const assignedOrdersCount = orders.filter(
              o => o.assigned_delivery_user_id === driver.id && o.delivery_date === selectedDate
            ).length;

            return (
              <button
                key={driver.id}
                onClick={() => toggleDriverDuty(driver.id, selectedDate)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isOnDuty 
                    ? 'bg-emerald-500/[0.06] border-emerald-500/30 ring-1 ring-emerald-500/20' 
                    : 'bg-[#F5F5F7] border-black/[0.04] opacity-50'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">{driver.full_name}</div>
                  <div className="text-[10px] text-[#86868B]">{driver.phone_number}</div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    {assignedOrdersCount} trips assigned
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isOnDuty ? 'bg-emerald-600 text-white' : 'bg-black/10 text-[#424245]'
                }`}>
                  {isOnDuty ? 'ON DUTY' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-[#FBFBFD]">
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F]">
              Home Deliveries • {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <span className="text-xs text-[#86868B]">
              {dateHomeOrders.length} Deliveries scheduled
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#86868B] font-medium border-b border-black/[0.06]">
              <tr>
                <th className="py-3 px-4">SO #</th>
                <th className="py-3 px-4">Slot</th>
                <th className="py-3 px-4">Customer & Suburb</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Payment Balance</th>
                <th className="py-3 px-4">Vehicle / Driver</th>
                <th className="py-3 px-4">WhatsApp Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {dateHomeOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#86868B]">
                    No home deliveries scheduled for {selectedDate}.
                  </td>
                </tr>
              ) : (
                dateHomeOrders.map(order => {
                  const isFourWheeler = order.assignment_type === 'four_wheeler';
                  const isPorter = order.assignment_type === 'porter_uber';
                  const isDriver = order.assignment_type === 'driver';

                  return (
                    <tr key={order.id} className="hover:bg-[#F5F5F7]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1D1D1F]">
                        {order.tally_so_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1D1D1F]">
                        {order.delivery_time_slot}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1D1D1F]">{order.customer_name}</div>
                        <div className="text-[11px] text-[#6E6E73] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#0071E3]" />
                          {order.delivery_area}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          {order.items.map(i => (
                            <div key={i.id} className="text-[#424245] truncate">
                              • {i.item_name} ({i.size_or_weight})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {order.payment_status === 'credit' ? (
                          <span className="text-purple-700">Credit Account</span>
                        ) : order.pending_amount > 0 ? (
                          <span className="text-rose-600">₹{order.pending_amount} DUE</span>
                        ) : (
                          <span className="text-emerald-600">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
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
                            className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-black/[0.08] bg-white font-medium"
                          >
                            <option value="unassigned">-- Select Vehicle --</option>
                            <option value="driver">🛵 Bike Rider (In-house)</option>
                            <option value="four_wheeler">🚙 4-Wheeler AC Cab</option>
                            <option value="porter_uber">📦 Porter / Uber</option>
                          </select>

                          {isDriver && (
                            <select
                              value={order.assigned_delivery_user_id || ''}
                              onChange={e => assignVehicleOrDriver(order.id, 'driver', e.target.value)}
                              className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-[#0071E3]/30 bg-[#0071E3]/[0.05] text-[#0071E3] font-semibold"
                            >
                              <option value="">Select On-Duty Rider...</option>
                              {onDutyDeliveryBoys.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isFourWheeler ? (
                          <button
                            onClick={() => handleCopyFourWheelerText(order)}
                            className="px-2.5 py-1.5 bg-black hover:bg-black/80 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                          >
                            {copiedOrderId === order.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Template
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[#86868B] text-[11px]">-</span>
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
