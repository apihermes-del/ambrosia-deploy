'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Phone, Shield, ArrowRight, CheckCircle2, AlertCircle, Lock, RefreshCw } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhone, users } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [matchedUserName, setMatchedUserName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    const found = users.find(u => u.phone_number.replace(/[^0-9]/g, '').slice(-10) === cleanInput);

    if (!found) {
      setErrorMessage('This contact number is not registered in Ambrosia team roster. Please contact Admin.');
      return;
    }

    if (!found.is_active) {
      setErrorMessage('Account is inactive. Please contact Admin.');
      return;
    }

    // Generate random 4-digit OTP for instant demonstration
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedDemoOtp(code);
    setMatchedUserName(found.full_name);
    setStep('otp');
    setOtpCode(code); // Pre-fill for seamless 1-click verification
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = loginWithPhone(phoneNumber, otpCode);
    if (!res.success) {
      setErrorMessage(res.message || 'Verification failed');
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
          <h2 className="text-base font-semibold text-[#1D1D1F]">Ambrosia Team Login</h2>
          <p className="text-xs text-[#86868B] mt-0.5">Enter your registered mobile number for OTP access</p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Registered Contact Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#86868B]">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98470 12340"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-3 py-2 text-sm border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3] font-mono font-medium"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[10px] text-[#86868B] mt-1.5">
                Authorized staff registered in Admin Settings can log in.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-black/90 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Send OTP Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
              <div className="font-semibold">Welcome, {matchedUserName}!</div>
              <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center justify-between">
                <span>OTP sent to: <strong>+91 {phoneNumber.slice(-10)}</strong></span>
                <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                  {generatedDemoOtp}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Enter 4-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2 border border-black/[0.1] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-1/3 py-2.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] font-medium text-xs rounded-xl transition-all"
              >
                Change #
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter</span>
              </button>
            </div>
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
