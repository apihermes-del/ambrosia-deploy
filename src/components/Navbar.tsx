'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { 
  Cake, 
  Truck, 
  Headphones, 
  Store, 
  ShieldCheck, 
  Users, 
  ChevronDown 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUserRole, users, setCurrentUser } = useApp();

  const roleTabs = [
    { id: 'desk', label: 'Customer Care', icon: Headphones, roles: ['super_admin', 'customer_care'] },
    { id: 'kitchen', label: 'Cake Setting & Kitchen', icon: Cake, roles: ['super_admin', 'cake_setting'] },
    { id: 'delivery', label: 'Delivery Dispatch', icon: Truck, roles: ['super_admin', 'delivery'] },
    { id: 'outlet', label: 'Outlet Counter Pickups', icon: Store, roles: ['super_admin', 'customer_care', 'cake_setting', 'outlet'] },
    { id: 'admin', label: 'Admin & Tally Closeout', icon: ShieldCheck, roles: ['super_admin'] },
  ];

  return (
    <header className="bg-amber-950 text-amber-50 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-serif font-black text-xl">
              A
            </div>
            <div>
              <span className="font-serif tracking-wider text-xl font-bold text-amber-100 flex items-center gap-1.5">
                Ambrosia <span className="text-xs uppercase bg-amber-600/40 text-amber-300 px-2 py-0.5 rounded font-sans tracking-normal border border-amber-500/40">Bakery Ops</span>
              </span>
              <p className="text-[11px] text-amber-300/80 -mt-0.5 font-medium">Order Fulfillment System</p>
            </div>
          </div>

          {/* Quick Role Simulator Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-amber-900/60 p-1 rounded-lg border border-amber-800 text-xs text-amber-200">
              <span className="px-2 font-medium text-amber-400">View as Role:</span>
              <button 
                onClick={() => setCurrentUserRole('customer_care')}
                className={`px-2.5 py-1 rounded transition-colors ${currentUser.role === 'customer_care' ? 'bg-amber-500 text-amber-950 font-bold' : 'hover:bg-amber-800'}`}
              >
                Care Desk
              </button>
              <button 
                onClick={() => setCurrentUserRole('cake_setting')}
                className={`px-2.5 py-1 rounded transition-colors ${currentUser.role === 'cake_setting' ? 'bg-amber-500 text-amber-950 font-bold' : 'hover:bg-amber-800'}`}
              >
                Kitchen
              </button>
              <button 
                onClick={() => setCurrentUserRole('delivery')}
                className={`px-2.5 py-1 rounded transition-colors ${currentUser.role === 'delivery' ? 'bg-amber-500 text-amber-950 font-bold' : 'hover:bg-amber-800'}`}
              >
                Delivery
              </button>
              <button 
                onClick={() => setCurrentUserRole('super_admin')}
                className={`px-2.5 py-1 rounded transition-colors ${currentUser.role === 'super_admin' ? 'bg-amber-500 text-amber-950 font-bold' : 'hover:bg-amber-800'}`}
              >
                Admin
              </button>
            </div>

            {/* Current User Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-amber-900/80 hover:bg-amber-900 border border-amber-700/80 px-3 py-1.5 rounded-lg text-sm text-left">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.full_name[0]}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold leading-tight text-white">{currentUser.full_name}</div>
                  <div className="text-[10px] text-amber-300 capitalize">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-amber-300 ml-1" />
              </button>

              <div className="absolute right-0 mt-1 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 hidden group-hover:block z-50 py-1">
                <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Switch Active User
                </div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 ${u.id === currentUser.id ? 'bg-amber-100 font-semibold text-amber-950' : ''}`}
                  >
                    <div>
                      <div className="text-gray-900">{u.full_name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{u.role.replace('_', ' ')}</div>
                    </div>
                    {u.id === currentUser.id && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Role Navigation Tabs */}
      <div className="bg-amber-900/90 border-t border-amber-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {roleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-amber-950 font-bold shadow-sm' 
                    : 'text-amber-200/90 hover:bg-amber-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-950' : 'text-amber-300'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
