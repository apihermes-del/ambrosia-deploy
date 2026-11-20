'use client';

import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { CustomerCareView } from '@/components/CustomerCareView';
import { CakeSettingView } from '@/components/CakeSettingView';
import { DeliveryDispatchView } from '@/components/DeliveryDispatchView';
import { OutletPickupView } from '@/components/OutletPickupView';
import { AdminCloseoutView } from '@/components/AdminCloseoutView';

export default function Home() {
  const [activeTab, setActiveTab] = useState('desk');

  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 pb-16">
          {activeTab === 'desk' && <CustomerCareView />}
          {activeTab === 'kitchen' && <CakeSettingView />}
          {activeTab === 'delivery' && <DeliveryDispatchView />}
          {activeTab === 'outlet' && <OutletPickupView />}
          {activeTab === 'admin' && <AdminCloseoutView />}
        </main>

        <footer className="bg-stone-100 border-t border-stone-200 py-4 text-center text-xs text-stone-500">
          Ambrosia Bakery Operations Hub • Phase 1 Real-time Order Tracking • 100% Free Stack (Next.js + Supabase)
        </footer>
      </div>
    </AppProvider>
  );
}
