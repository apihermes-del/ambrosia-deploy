'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { History, X, Clock, User, Search, Filter } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchSO?: string;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, initialSearchSO = '' }) => {
  const { logs, orders } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialSearchSO);

  if (!isOpen) return null;

  // Map order IDs to their Tally SO numbers for quick reference
  const orderIdToSoMap = new Map<string, string>();
  orders.forEach(o => {
    orderIdToSoMap.set(o.id, o.tally_so_number);
  });

  // Filter logs based on SO search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredLogs = logs.filter(log => {
    if (!trimmedQuery) return true;
    
    // Check direct log order_id match
    const orderIdMatch = log.order_id?.toLowerCase().includes(trimmedQuery);
    
    // Check if the log belongs to an order whose Tally SO matches
    const mappedSO = orderIdToSoMap.get(log.order_id)?.toLowerCase() || '';
    const soMatch = mappedSO.includes(trimmedQuery);
    
    // Check action or details text
    const actionMatch = log.action.toLowerCase().includes(trimmedQuery);
    const detailsMatch = log.details?.toLowerCase().includes(trimmedQuery);
    const userMatch = log.user_name.toLowerCase().includes(trimmedQuery);

    return orderIdMatch || soMatch || actionMatch || detailsMatch || userMatch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 animate-scale-up overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Bakery Operations Audit Trail</h3>
              <p className="text-xs text-gray-500">Track changes, transitions, and user accountability per order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar for SO Number */}
        <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Tally SO # (e.g. SO-2026-0891), order ID, or user..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-[#F5F5F7] focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 whitespace-nowrap">
              {filteredLogs.length} found
            </span>
          )}
        </div>

        {/* Log List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-stone-50/40">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              {searchQuery ? `No logs found matching "${searchQuery}".` : 'No activity logged yet.'}
            </div>
          ) : (
            filteredLogs.map(log => {
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateFormatted = new Date(log.timestamp).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              });

              const mappedSO = orderIdToSoMap.get(log.order_id);

              return (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-xl border border-black/[0.06] bg-white shadow-2xs hover:border-amber-400/50 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-900">{log.action}</span>
                      {mappedSO ? (
                        <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-300">
                          SO: {mappedSO}
                        </span>
                      ) : log.order_id && !['SYSTEM', 'ROSTER', 'CLOSEOUT'].includes(log.order_id) ? (
                        <span className="font-mono text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                          {log.order_id}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {dateFormatted}, {timeFormatted}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-1.5 text-gray-600 text-[11px] leading-relaxed font-sans">
                      {log.details}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>By: <strong className="text-gray-800">{log.user_name}</strong> ({log.user_role.replace('_', ' ')})</span>
                    </div>
                    {mappedSO && (
                      <button
                        onClick={() => setSearchQuery(mappedSO)}
                        className="text-[#0071E3] hover:underline font-mono font-medium"
                      >
                        Filter this SO
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-white flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Total records: {logs.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
