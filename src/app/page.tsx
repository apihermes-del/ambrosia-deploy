'use client';

import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { CustomerCareView } from '@/components/CustomerCareView';
import { CakeSettingView } from '@/components/CakeSettingView';
import { DeliveryLeadView } from '@/components/DeliveryLeadView';
import { DeliveryDriverView } from '@/components/DeliveryDriverView';
import { OutletPickupView } from '@/components/OutletPickupView';
import { AdminCloseoutView } from '@/components/AdminCloseoutView';
import { DeliveryCalendarPricingView } from '@/components/DeliveryCalendarPricingView';
import { AuditLogModal } from '@/components/AuditLogModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('desk');
  const [showLogsModal, setShowLogsModal] = useState(false);

  return (
    <AppProvider>
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
        </main>

        <AuditLogModal 
          isOpen={showLogsModal} 
          onClose={() => setShowLogsModal(false)} 
        />

        <footer className="bg-stone-100 border-t border-stone-200 py-3 text-center text-xs text-stone-500">
          Ambrosia Bakery Operations Hub • Bakery Junction, Trivandrum • Free Tier Architecture (Next.js + Supabase)
        </footer>
      </div>
    </AppProvider>
  );
}
