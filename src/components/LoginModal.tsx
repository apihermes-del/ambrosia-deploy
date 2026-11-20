'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPin, updateUserPin, users } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // First-time reset PIN state
  const [isFirstTimeReset, setIsFirstTimeReset] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (!cleanInput || cleanInput.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!pinCode.trim()) {
      setErrorMessage('Please enter your PIN or password.');
      return;
    }

    const res = loginWithPin(phoneNumber, pinCode);
    if (!res.success) {
      setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
      return;
    }

    // Check if the user is logging in with default PIN (1234) or has must_reset_pin flag
    const loggedUser = users.find(u => u.phone_number.replace(/[^0-9]/g, '').slice(-10) === cleanInput);
    if (loggedUser && (loggedUser.must_reset_pin || loggedUser.pin === '1234') && loggedUser.role !== 'super_admin') {
      setAuthenticatedUserId(loggedUser.id);
      setIsFirstTimeReset(true);
      return;
    }

    onClose();
  };

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPin.trim().length < 4) {
      setErrorMessage('Your new secret PIN must be at least 4 characters/digits.');
      return;
    }

    if (newPin.trim() === '1234') {
      setErrorMessage('Please choose a personal secret PIN other than the default "1234".');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMessage('New PIN and Confirm PIN do not match.');
      return;
    }

    if (authenticatedUserId) {
      updateUserPin(authenticatedUserId, newPin.trim(), true);
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
          <h2 className="text-base font-semibold text-[#1D1D1F]">
            {isFirstTimeReset ? 'Set Your Personal PIN' : 'Ambrosia Staff Sign In'}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5">
            {isFirstTimeReset 
              ? 'First-time login: update default PIN 1234 to your own secret PIN' 
              : 'Enter your registered mobile number and PIN'}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isFirstTimeReset ? (
          /* Normal Sign In Form */
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
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
                  placeholder="98470 12345"
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
                  placeholder="Staff default: 1234"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3] font-mono"
                  required
                />
              </div>
              <p className="text-[10px] text-[#86868B] mt-1.5">
                Default PIN for new staff is <strong>1234</strong>.
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
        ) : (
          /* First-Time PIN Setup Form */
          <form onSubmit={handleResetPinSubmit} className="mt-5 space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>First-Time Security Setup:</strong> Please change your PIN from default <strong>1234</strong> to your own private 4-digit code.
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Create New PIN (e.g. 4 digits)
              </label>
              <input
                type="password"
                maxLength={8}
                placeholder="Enter new private PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Confirm New PIN
              </label>
              <input
                type="password"
                maxLength={8}
                placeholder="Re-enter new PIN"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Private PIN & Enter</span>
            </button>
          </form>
        )}

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
