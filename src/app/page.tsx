'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { CustomerCareView } from '@/components/CustomerCareView';
import { CakeSettingView } from '@/components/CakeSettingView';
import { DeliveryLeadView } from '@/components/DeliveryLeadView';
import { DeliveryDriverView } from '@/components/DeliveryDriverView';
import { OutletPickupView } from '@/components/OutletPickupView';
import { AdminCloseoutView } from '@/components/AdminCloseoutView';
import { DeliveryCalendarPricingView } from '@/components/DeliveryCalendarPricingView';
import { AdminSettingsView } from '@/components/AdminSettingsView';
import { AuditLogModal } from '@/components/AuditLogModal';
import { LoginModal } from '@/components/LoginModal';
import { Lock, ArrowRight } from 'lucide-react';

function MainAppContent() {
  const { currentUser, authInitialized } = useApp();
  const [activeTab, setActiveTab] = useState('desk');
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // While checking saved session on initial load, show clean loading placeholder (prevents flash)
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm animate-pulse">
          A
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show Apple-style security lock screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/[0.08] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
            A
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-black/[0.05] text-[#424245] px-2.5 py-1 rounded-full border border-black/[0.05]">
              Ambrosia Bakery Operations Hub
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F] mt-3">
              Staff Access Required
            </h1>
            <p className="text-xs text-[#86868B] mt-1.5 max-w-xs mx-auto">
              This system is strictly restricted to authorized staff of Ambrosia Bakery, Bakery Junction, Trivandrum.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#1D1D1F]">
              <Lock className="w-4 h-4 text-[#0071E3]" />
              <span>Registered Mobile Number & OTP Verification</span>
            </div>
            <p className="text-[11px] text-[#86868B]">
              Only employees registered in the roster by Super Admin can sign in.
            </p>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-3.5 bg-black hover:bg-black/90 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Employee OTP Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-[#86868B]">
            Need access? Please contact your Ambrosia Branch Manager or Super Admin.
          </p>
        </div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setShowLogsModal={setShowLogsModal} 
      />
      
      <main className="flex-1 pb-16">
        {activeTab === 'desk' && <CustomerCareView />}
        {activeTab === 'calendar' && <DeliveryCalendarPricingView />}
        {activeTab === 'kitchen' && <CakeSettingView />}
        {activeTab === 'delivery_lead' && <DeliveryLeadView />}
        {activeTab === 'delivery' && <DeliveryDriverView />}
        {activeTab === 'outlet' && <OutletPickupView />}
        {activeTab === 'admin' && <AdminCloseoutView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </main>

      <AuditLogModal 
        isOpen={showLogsModal} 
        onClose={() => setShowLogsModal(false)} 
      />

      <footer className="bg-stone-100 border-t border-stone-200 py-3 text-center text-xs text-stone-500">
        Ambrosia Bakery Operations Hub • Bakery Junction, Trivandrum • Active User: <strong>{currentUser.full_name}</strong> ({currentUser.role.replace('_', ' ')})
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
