'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { History, X, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { logs } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Bakery Operations Audit Trail</h3>
              <p className="text-xs text-gray-500">Chronological activity log recording who made what changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No activity logged yet.</div>
          ) : (
            logs.map(log => {
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateFormatted = new Date(log.timestamp).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div 
                  key={log.id} 
                  className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 text-xs hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.action}</span>
                      {log.order_id && log.order_id !== 'SYSTEM' && log.order_id !== 'ROSTER' && log.order_id !== 'CLOSEOUT' && (
                        <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          {log.order_id}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateFormatted}, {timeFormatted}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-1 text-gray-600 text-[11px] leading-relaxed">
                      {log.details}
                    </div>
                  )}

                  <div className="mt-2 pt-1.5 border-t border-gray-200/50 flex items-center gap-1.5 text-[10px] text-gray-500">
                    <User className="w-3 h-3 text-amber-700" />
                    <span>Changed by: <strong className="text-gray-800">{log.user_name}</strong> ({log.user_role.replace('_', ' ')})</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
