'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPin, users } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (!cleanInput || cleanInput.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!pinCode.trim()) {
      setErrorMessage('Please enter your secret PIN or password.');
      return;
    }

    const res = loginWithPin(phoneNumber, pinCode);
    if (!res.success) {
      setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/[0.08] animate-scale-up">
        
        {/* Header */}
        <div className="text-center pb-4 border-b border-black/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg mx-auto mb-2 shadow-xs">
            A
          </div>
          <h2 className="text-base font-semibold text-[#1D1D1F]">Ambrosia Staff Sign In</h2>
          <p className="text-xs text-[#86868B] mt-0.5">Enter your registered mobile number and PIN</p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
              Registered Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#86868B]">
                +91
              </span>
              <input
                type="tel"
                placeholder="77362 82122"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-3 py-2 text-sm border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3] font-mono font-medium"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                Secret PIN / Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#0071E3] hover:underline flex items-center gap-1 font-medium"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter 4-digit PIN or Admin password"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3] font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-[#86868B] mt-1.5">
              Default staff PIN is configured by Admin in Settings.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-black hover:bg-black/90 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Verify & Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-black/[0.04] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#86868B] hover:text-black font-medium"
          >
            Cancel / Close
          </button>
        </div>

      </div>
    </div>
  );
};
