'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Cake, 
  Truck, 
  Headphones, 
  Store, 
  ShieldCheck, 
  History, 
  Calendar,
  ChevronDown,
  Navigation,
  Sliders,
  Sparkles,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { LoginModal } from '@/components/LoginModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowLogsModal: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, setShowLogsModal }) => {
  const { currentUser, setCurrentUserRole, users, setCurrentUser, logs, logout } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const allTabs = [
    { id: 'desk', label: 'Customer Care', icon: Headphones, allowedRoles: ['super_admin', 'customer_care'] },
    { id: 'calendar', label: 'Slot Calendar & Rates', icon: Calendar, allowedRoles: ['super_admin', 'customer_care', 'delivery_lead'] },
    { id: 'kitchen', label: 'Cake Setting & Kitchen', icon: Cake, allowedRoles: ['super_admin', 'cake_setting', 'customer_care'] },
    { id: 'delivery_lead', label: 'Delivery Assignment', icon: Navigation, allowedRoles: ['super_admin', 'delivery_lead', 'customer_care'] },
    { id: 'delivery', label: 'Driver App View', icon: Truck, allowedRoles: ['super_admin', 'delivery', 'delivery_lead', 'customer_care'] },
    { id: 'outlet', label: 'Outlet Pickups', icon: Store, allowedRoles: ['super_admin', 'customer_care', 'cake_setting', 'outlet'] },
    { id: 'admin', label: 'Day Closeout', icon: ShieldCheck, allowedRoles: ['super_admin', 'customer_care', 'delivery_lead'] },
    { id: 'settings', label: 'Settings', icon: Sliders, allowedRoles: ['super_admin'] },
  ];

  const visibleTabs = allTabs.filter(tab => currentUser && tab.allowedRoles.includes(currentUser.role));

  React.useEffect(() => {
    if (!currentUser) return;
    if (!visibleTabs.some(t => t.id === activeTab)) {
      if (currentUser.role === 'delivery') {
        setActiveTab('delivery');
      } else if (currentUser.role === 'cake_setting') {
        setActiveTab('kitchen');
      } else {
        setActiveTab(visibleTabs[0]?.id || 'desk');
      }
    }
  }, [currentUser, activeTab, visibleTabs, setActiveTab]);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-base text-[#1D1D1F]">
                  Ambrosia
                </span>
                <span className="text-[10px] uppercase font-mono font-medium tracking-wider bg-black/[0.05] text-[#424245] px-2 py-0.5 rounded-full border border-black/[0.04]">
                  Operations
                </span>
              </div>
              <p className="text-[11px] text-[#86868B] font-medium leading-none mt-0.5">Bakery Junction • Trivandrum</p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audit Logs Pill */}
            <button
              onClick={() => setShowLogsModal(true)}
              className="flex items-center gap-1.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] border border-black/[0.06] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              title="View Operations Audit Log"
            >
              <History className="w-3.5 h-3.5 text-[#86868B]" />
              <span className="hidden sm:inline">Audit Trail</span>
              <span className="bg-black/10 text-[#1D1D1F] font-mono font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {logs.length}
              </span>
            </button>

            {/* Super Admin Quick Test Switcher */}
            {currentUser?.role === 'super_admin' && (
              <div className="hidden xl:flex items-center bg-[#E8E8ED]/70 p-1 rounded-xl border border-black/[0.04] text-xs">
                <span className="px-2 font-medium text-[#86868B]">Admin Switch:</span>
                <button 
                  onClick={() => setCurrentUserRole('customer_care')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#6E6E73] hover:text-black hover:bg-white/60 transition-all"
                >
                  Desk
                </button>
                <button 
                  onClick={() => setCurrentUserRole('cake_setting')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#6E6E73] hover:text-black hover:bg-white/60 transition-all"
                >
                  Kitchen
                </button>
                <button 
                  onClick={() => setCurrentUserRole('delivery_lead')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#6E6E73] hover:text-black hover:bg-white/60 transition-all"
                >
                  Dispatch
                </button>
                <button 
                  onClick={() => setCurrentUserRole('delivery')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#6E6E73] hover:text-black hover:bg-white/60 transition-all"
                >
                  Rider
                </button>
              </div>
            )}

            {/* User Profile Selector (Mobile tap & Desktop click friendly) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-black/[0.06] px-2.5 py-1.5 rounded-xl text-xs transition-all text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0071E3] text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                  {currentUser ? currentUser.full_name[0] : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold leading-tight text-[#1D1D1F]">
                    {currentUser ? currentUser.full_name : 'Guest'}
                  </div>
                  <div className="text-[10px] text-[#86868B] capitalize">
                    {currentUser ? currentUser.role.replace('_', ' ') : 'Not signed in'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868B] ml-0.5" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl text-gray-800 rounded-2xl shadow-2xl border border-black/[0.08] z-50 py-2">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#86868B] uppercase tracking-wider border-b border-black/[0.04]">
                      Current Employee Session
                    </div>

                    <div className="p-3 border-b border-black/[0.04] bg-[#F5F5F7]/40">
                      <div className="font-semibold text-xs text-[#1D1D1F]">{currentUser?.full_name}</div>
                      <div className="text-[10px] text-[#86868B] font-mono mt-0.5">{currentUser?.phone_number}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[9px] font-semibold rounded-md uppercase tracking-wider">
                        {currentUser?.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLoginModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-left flex items-center gap-2 text-[#1D1D1F]"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>Switch Staff / Re-verify OTP</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-xs font-medium text-left flex items-center gap-2 text-rose-600 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Hub</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-[#F5F5F7] hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-black/[0.06] px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </div>

      {/* Modern Minimalist Horizontal Tab Navigation (Touch & Click optimized) */}
      <div className="border-t border-black/[0.04] bg-[#F5F5F7] px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scroll-smooth no-scrollbar">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex-shrink-0 select-none ${
                  isActive 
                    ? 'bg-black text-white font-semibold shadow-xs' 
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] bg-white sm:bg-transparent border border-black/[0.06] sm:border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#86868B]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
};
