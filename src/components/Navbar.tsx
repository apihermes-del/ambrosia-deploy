'use client';

import React from 'react';
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
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowLogsModal: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, setShowLogsModal }) => {
  const { currentUser, setCurrentUserRole, users, setCurrentUser, logs } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  const visibleTabs = allTabs.filter(tab => tab.allowedRoles.includes(currentUser.role));

  React.useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeTab)) {
      if (currentUser.role === 'delivery') {
        setActiveTab('delivery');
      } else if (currentUser.role === 'cake_setting') {
        setActiveTab('kitchen');
      } else {
        setActiveTab(visibleTabs[0]?.id || 'desk');
      }
    }
  }, [currentUser.role, activeTab, visibleTabs, setActiveTab]);

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

            {/* Apple-style Segmented Role Switcher */}
            <div className="hidden lg:flex items-center bg-[#E8E8ED]/70 p-1 rounded-xl border border-black/[0.04] text-xs">
              <span className="px-2 font-medium text-[#86868B]">Role:</span>
              <button 
                onClick={() => setCurrentUserRole('customer_care')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentUser.role === 'customer_care' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-black'}`}
              >
                Desk
              </button>
              <button 
                onClick={() => setCurrentUserRole('cake_setting')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentUser.role === 'cake_setting' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-black'}`}
              >
                Kitchen
              </button>
              <button 
                onClick={() => setCurrentUserRole('delivery_lead')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentUser.role === 'delivery_lead' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-black'}`}
              >
                Dispatch Lead
              </button>
              <button 
                onClick={() => setCurrentUserRole('delivery')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentUser.role === 'delivery' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-black'}`}
              >
                Rider
              </button>
              <button 
                onClick={() => setCurrentUserRole('super_admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentUser.role === 'super_admin' ? 'bg-white text-black shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-black'}`}
              >
                Admin
              </button>
            </div>

            {/* User Profile Selector (Mobile tap & Desktop click friendly) */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-black/[0.06] px-2.5 py-1.5 rounded-xl text-xs transition-all text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-[#0071E3] text-white font-bold flex items-center justify-center text-[11px] shadow-2xs">
                  {currentUser.full_name[0]}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold leading-tight text-[#1D1D1F]">{currentUser.full_name}</div>
                  <div className="text-[10px] text-[#86868B] capitalize">{currentUser.role.replace('_', ' ')}</div>
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
                      Switch User Account
                    </div>
                    
                    {/* Role quick switcher on mobile inside dropdown */}
                    <div className="p-2 border-b border-black/[0.04] grid grid-cols-2 gap-1 text-[11px]">
                      <button 
                        onClick={() => { setCurrentUserRole('customer_care'); setIsUserMenuOpen(false); }}
                        className="py-1 px-2 rounded-lg bg-[#F5F5F7] text-left font-medium hover:bg-[#E8E8ED]"
                      >
                        Care Desk
                      </button>
                      <button 
                        onClick={() => { setCurrentUserRole('cake_setting'); setIsUserMenuOpen(false); }}
                        className="py-1 px-2 rounded-lg bg-[#F5F5F7] text-left font-medium hover:bg-[#E8E8ED]"
                      >
                        Kitchen
                      </button>
                      <button 
                        onClick={() => { setCurrentUserRole('delivery_lead'); setIsUserMenuOpen(false); }}
                        className="py-1 px-2 rounded-lg bg-[#F5F5F7] text-left font-medium hover:bg-[#E8E8ED]"
                      >
                        Dispatch Lead
                      </button>
                      <button 
                        onClick={() => { setCurrentUserRole('delivery'); setIsUserMenuOpen(false); }}
                        className="py-1 px-2 rounded-lg bg-[#F5F5F7] text-left font-medium hover:bg-[#E8E8ED]"
                      >
                        Rider
                      </button>
                      <button 
                        onClick={() => { setCurrentUserRole('super_admin'); setIsUserMenuOpen(false); }}
                        className="col-span-2 py-1 px-2 rounded-lg bg-black text-white text-center font-medium"
                      >
                        Super Admin
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-black/[0.03]">
                      {users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setCurrentUser(u);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F5F5F7] transition-colors ${u.id === currentUser.id ? 'bg-[#0071E3]/[0.08] font-semibold text-[#0071E3]' : 'text-[#1D1D1F]'}`}
                        >
                          <div>
                            <div>{u.full_name}</div>
                            <div className="text-[10px] text-[#86868B] capitalize">{u.role.replace('_', ' ')}</div>
                          </div>
                          {u.id === currentUser.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modern Minimalist Horizontal Tab Navigation (Horizontal Scrollable on Mobile with Touch Momentum) */}
      <div className="border-t border-black/[0.04] bg-[#F5F5F7] px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scroll-smooth -mx-1 px-1 touch-pan-x">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'bg-black text-white font-semibold shadow-xs' 
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] bg-white sm:bg-transparent border border-black/[0.05] sm:border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#86868B]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
