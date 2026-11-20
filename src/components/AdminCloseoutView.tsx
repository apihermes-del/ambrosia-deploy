'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, FileCheck, CheckCircle2, Search, ArrowRight, IndianRupee, Layers } from 'lucide-react';

export const AdminCloseoutView: React.FC = () => {
  const { orders, updateTallySINumber } = useApp();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [siInput, setSiInput] = useState('');
  const [search, setSearch] = useState('');

  // Orders that are either delivered or collected
  const completedOrders = orders.filter(o => ['delivered', 'collected'].includes(o.status));

  const filtered = completedOrders.filter(o => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      o.tally_so_number.toLowerCase().includes(q) ||
      (o.tally_si_number && o.tally_si_number.toLowerCase().includes(q)) ||
      o.customer_name.toLowerCase().includes(q)
    );
  });

  const pendingSIOrders = filtered.filter(o => !o.tally_si_number);
  const reconciledOrders = filtered.filter(o => Boolean(o.tally_si_number));

  const handleSaveSI = (orderId: string) => {
    if (!siInput.trim()) return;
    updateTallySINumber(orderId, siInput.trim().toUpperCase());
    setEditingOrderId(null);
    setSiInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200/60">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Admin & Tally Closeout
            <span className="text-xs bg-emerald-600 text-white font-sans font-semibold px-2.5 py-0.5 rounded-full">
              Phase 1 Closing
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Orders that have been handed over or delivered. Enter the converted Tally Sales Invoice (SI) Number to close the billing cycle.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search SO #, SI #, Customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white shadow-2xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-500 block font-medium">Delivered / Collected Orders</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{completedOrders.length}</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-xs text-amber-800 block font-medium">Awaiting Tally Sales Invoice (SI)</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{pendingSIOrders.length}</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 block font-medium">Fully Invoiced & Reconciled</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{reconciledOrders.length}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Tally Sales Order to Sales Invoice Reconciliation
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Tally SO Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type & Completion</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Collection Status</th>
                <th className="py-3 px-4">Tally Sales Invoice (SI) #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => {
                const isEditing = editingOrderId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-amber-50/20">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {order.tally_so_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{order.customer_name}</div>
                      <div className="text-[11px] text-gray-500">{order.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.status} ({order.order_type === 'home_delivery' ? 'Home' : 'Outlet'})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{order.total_amount}
                    </td>
                    <td className="py-3 px-4">
                      {order.pending_amount <= 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Settled
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">
                          ₹{order.pending_amount} Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {order.tally_si_number ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                            {order.tally_si_number}
                          </span>
                          <button
                            onClick={() => {
                              setEditingOrderId(order.id);
                              setSiInput(order.tally_si_number || '');
                            }}
                            className="text-[10px] text-gray-400 hover:text-gray-600 underline"
                          >
                            Edit
                          </button>
                        </div>
                      ) : isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. SI-2026-1044"
                            value={siInput}
                            onChange={e => setSiInput(e.target.value)}
                            className="w-32 px-2 py-1 text-xs font-mono uppercase border border-amber-400 rounded focus:ring-1 focus:ring-amber-500 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveSI(order.id)}
                            className="px-2 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-1.5 py-1 text-xs text-gray-500 hover:text-gray-700"
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

    </div>
  );
};
