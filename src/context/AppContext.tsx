'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Order, 
  UserProfile, 
  Kitchen, 
  PickupLocation, 
  OrderStatus, 
  ItemStatus, 
  OrderLog, 
  AdminSettingsConfig,
  AssignmentType,
  PaymentMode
} from '@/types';
import { initialOrders, mockUsers, mockKitchens, mockPickupLocations, initialLogs } from '@/lib/mockData';
import { defaultSettingsConfig } from '@/lib/deliveryPricing';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AppContextType {
  orders: Order[];
  logs: OrderLog[];
  currentUser: UserProfile;
  users: UserProfile[];
  kitchens: Kitchen[];
  pickupLocations: PickupLocation[];
  setKitchens: (kitchens: Kitchen[]) => void;
  setPickupLocations: (locations: PickupLocation[]) => void;
  addPickupLocation: (name: string, category: PickupLocation['category']) => void;
  removePickupLocation: (id: string) => void;
  addKitchen: (name: string, description?: string) => void;
  removeKitchen: (id: string) => void;
  onDutyDrivers: string[]; // for backwards compatibility / today
  getOnDutyDriversForDate: (date: string) => string[];
  settingsConfig: AdminSettingsConfig;
  updateSettingsConfig: (config: AdminSettingsConfig) => void;
  setCurrentUserRole: (role: UserProfile['role']) => void;
  setCurrentUser: (user: UserProfile) => void;
  addLog: (orderId: string, action: string, details?: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'pending_amount'>) => void;
  updateOrder: (orderId: string, updatedFields: Partial<Order>, editSummary?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: Partial<Order>, actionNote?: string) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus, kitchenId?: string, photoUrl?: string) => void;
  assignVehicleOrDriver: (orderId: string, assignmentType: AssignmentType, driverUserId?: string, thirdPartyRef?: string) => void;
  toggleDriverDuty: (driverUserId: string, date?: string) => void;
  markDelivered: (orderId: string, paymentCollected: number, paymentMode: PaymentMode) => void;
  markCollected: (orderId: string) => void;
  updateTallySINumber: (orderId: string, tallySINumber: string) => void;
  closeDriverDay: (driverUserId: string) => void;
  closeAdminDayReconciliation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_orders_v3');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return initialOrders;
  });

  const [logs, setLogs] = useState<OrderLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_logs_v3');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return initialLogs;
  });

  const [settingsConfig, setSettingsConfig] = useState<AdminSettingsConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_admin_settings');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return defaultSettingsConfig;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]);
  const [users] = useState<UserProfile[]>(mockUsers);
  const [kitchens, setKitchens] = useState<Kitchen[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_kitchens');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockKitchens;
  });

  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_pickup_locations');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockPickupLocations;
  });

  useEffect(() => {
    localStorage.setItem('ambrosia_kitchens', JSON.stringify(kitchens));
  }, [kitchens]);

  useEffect(() => {
    localStorage.setItem('ambrosia_pickup_locations', JSON.stringify(pickupLocations));
  }, [pickupLocations]);

  const addPickupLocation = (name: string, category: PickupLocation['category']) => {
    const newLoc: PickupLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      category,
      is_active: true,
    };
    setPickupLocations(prev => [...prev, newLoc]);
    addLog('SYSTEM', 'Pickup Location Added', `${name} (${category.replace('_', ' ')})`);
  };

  const removePickupLocation = (id: string) => {
    setPickupLocations(prev => prev.filter(l => l.id !== id));
    addLog('SYSTEM', 'Pickup Location Removed', `ID: ${id}`);
  };

  const addKitchen = (name: string, description: string = '') => {
    const newK: Kitchen = {
      id: `k-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      description,
      is_active: true,
    };
    setKitchens(prev => [...prev, newK]);
    addLog('SYSTEM', 'Kitchen Added', name);
  };

  const removeKitchen = (id: string) => {
    setKitchens(prev => prev.filter(k => k.id !== id));
    addLog('SYSTEM', 'Kitchen Removed', `ID: ${id}`);
  };
  const [dailyRosters, setDailyRosters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem('ambrosia_daily_rosters');
    if (saved) {
      try { 
        setDailyRosters(JSON.parse(saved)); 
        return;
      } catch (e) { console.error(e); }
    }
    const today = new Date().toISOString().split('T')[0];
    setDailyRosters({
      [today]: ['u5', 'u6'], // Default Deepu & Suresh on duty today
    });
  }, []);

  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const onDutyDrivers = dailyRosters[todayStr] || ['u5', 'u6'];

  useEffect(() => {
    if (Object.keys(dailyRosters).length > 0) {
      localStorage.setItem('ambrosia_daily_rosters', JSON.stringify(dailyRosters));
    }
  }, [dailyRosters]);

  useEffect(() => {
    localStorage.setItem('ambrosia_orders_v3', JSON.stringify(orders));
    if (isSupabaseConfigured && supabase) {
      supabase.from('system_settings').upsert({
        key: 'ambrosia_orders_v3',
        value: orders,
        updated_at: new Date().toISOString()
      }).then();
    }
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ambrosia_logs_v3', JSON.stringify(logs));
    if (isSupabaseConfigured && supabase) {
      supabase.from('system_settings').upsert({
        key: 'ambrosia_logs_v3',
        value: logs,
        updated_at: new Date().toISOString()
      }).then();
    }
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('ambrosia_admin_settings', JSON.stringify(settingsConfig));
    if (isSupabaseConfigured && supabase) {
      supabase.from('system_settings').upsert({
        key: 'ambrosia_admin_settings',
        value: settingsConfig,
        updated_at: new Date().toISOString()
      }).then();
    }
  }, [settingsConfig]);

  useEffect(() => {
    localStorage.setItem('ambrosia_kitchens', JSON.stringify(kitchens));
    if (isSupabaseConfigured && supabase) {
      supabase.from('system_settings').upsert({
        key: 'ambrosia_kitchens',
        value: kitchens,
        updated_at: new Date().toISOString()
      }).then();
    }
  }, [kitchens]);

  useEffect(() => {
    localStorage.setItem('ambrosia_pickup_locations', JSON.stringify(pickupLocations));
    if (isSupabaseConfigured && supabase) {
      supabase.from('system_settings').upsert({
        key: 'ambrosia_pickup_locations',
        value: pickupLocations,
        updated_at: new Date().toISOString()
      }).then();
    }
  }, [pickupLocations]);

  useEffect(() => {
    if (Object.keys(dailyRosters).length > 0) {
      localStorage.setItem('ambrosia_daily_rosters', JSON.stringify(dailyRosters));
      if (isSupabaseConfigured && supabase) {
        supabase.from('system_settings').upsert({
          key: 'ambrosia_daily_rosters',
          value: dailyRosters,
          updated_at: new Date().toISOString()
        }).then();
      }
    }
  }, [dailyRosters]);

  // Initial load from Supabase & Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    // 1. Initial fetch from Supabase
    client.from('system_settings').select('*').then(({ data, error }) => {
      if (error || !data) return;
      data.forEach(item => {
        if (item.key === 'ambrosia_orders_v3' && Array.isArray(item.value)) {
          setOrders(item.value);
        } else if (item.key === 'ambrosia_logs_v3' && Array.isArray(item.value)) {
          setLogs(item.value);
        } else if (item.key === 'ambrosia_admin_settings' && item.value) {
          setSettingsConfig(item.value);
        } else if (item.key === 'ambrosia_kitchens' && Array.isArray(item.value)) {
          setKitchens(item.value);
        } else if (item.key === 'ambrosia_pickup_locations' && Array.isArray(item.value)) {
          setPickupLocations(item.value);
        } else if (item.key === 'ambrosia_daily_rosters' && item.value) {
          setDailyRosters(item.value);
        }
      });
    });

    // 2. Realtime listener across all devices / drivers / kitchens
    const channel = client
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        payload => {
          if (payload.new && (payload.new as any).key) {
            const { key, value } = payload.new as any;
            if (key === 'ambrosia_orders_v3' && Array.isArray(value)) {
              setOrders(value);
            } else if (key === 'ambrosia_logs_v3' && Array.isArray(value)) {
              setLogs(value);
            } else if (key === 'ambrosia_admin_settings' && value) {
              setSettingsConfig(value);
            } else if (key === 'ambrosia_kitchens' && Array.isArray(value)) {
              setKitchens(value);
            } else if (key === 'ambrosia_pickup_locations' && Array.isArray(value)) {
              setPickupLocations(value);
            } else if (key === 'ambrosia_daily_rosters' && value) {
              setDailyRosters(value);
            }
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const updateSettingsConfig = (newConfig: AdminSettingsConfig) => {
    setSettingsConfig(newConfig);
    addLog(
      'SYSTEM', 
      'Admin Settings Updated', 
      `Slots: ${newConfig.openingTime}-${newConfig.closingTime} (${newConfig.slotDurationHours}h), Drivers: ${newConfig.totalDeliveryEmployees}, Free: ${newConfig.freeRadiusKm}km`
    );
  };

  const addLog = (orderId: string, action: string, details?: string) => {
    const newLog: OrderLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const setCurrentUserRole = (role: UserProfile['role']) => {
    const found = users.find(u => u.role === role);
    if (found) setCurrentUser(found);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'pending_amount'>) => {
    const id = `ord-${Date.now()}`;
    const pending_amount = orderData.payment_status === 'credit' 
      ? orderData.total_amount 
      : Math.max(0, orderData.total_amount - orderData.advance_paid);

    const newOrder: Order = {
      ...orderData,
      id,
      pending_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderData.items.map(item => ({
        ...item,
        id: item.id || `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        order_id: id,
      }))
    };
    setOrders(prev => [newOrder, ...prev]);
    addLog(id, 'Order Created', `Tally SO: ${newOrder.tally_so_number} for ${newOrder.customer_name} (Type: ${newOrder.order_type})`);
  };

  const updateOrder = (orderId: string, updatedFields: Partial<Order>, editSummary?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const newTotal = updatedFields.total_amount !== undefined ? updatedFields.total_amount : order.total_amount;
      const newAdvance = updatedFields.advance_paid !== undefined ? updatedFields.advance_paid : order.advance_paid;
      const newPaymentStatus = updatedFields.payment_status || order.payment_status;
      const newPending = newPaymentStatus === 'credit' ? newTotal : Math.max(0, newTotal - newAdvance);

      return {
        ...order,
        ...updatedFields,
        total_amount: newTotal,
        advance_paid: newAdvance,
        pending_amount: newPending,
        payment_status: newPaymentStatus,
        is_edited_flag: true,
        edited_summary: editSummary || `Modified by ${currentUser.full_name}`,
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, 'Order Edited by Customer Care', editSummary || 'Order details updated');
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'cancelled',
        special_notes: `CANCELLED: ${reason} (by ${currentUser.full_name})`,
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, 'Order Cancelled', `Reason: ${reason}`);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, additionalData?: Partial<Order>, actionNote?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status,
        ...(additionalData || {}),
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, `Status changed to ${status.toUpperCase().replace(/_/g, ' ')}`, actionNote);
  };

  const updateItemStatus = (orderId: string, itemId: string, status: ItemStatus, kitchenId?: string, photoUrl?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const updatedItems = order.items.map(itm => {
        if (itm.id !== itemId) return itm;
        return {
          ...itm,
          status,
          ...(kitchenId ? { kitchen_id: kitchenId } : {}),
          ...(photoUrl ? { photo_url: photoUrl } : {}),
          ready_at: status === 'ready' ? new Date().toISOString() : itm.ready_at,
        };
      });

      return {
        ...order,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, `Item status updated to ${status}`, `Item ID: ${itemId}`);
  };

  const assignVehicleOrDriver = (orderId: string, assignmentType: AssignmentType, driverUserId?: string, thirdPartyRef?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        assignment_type: assignmentType,
        assigned_delivery_user_id: assignmentType === 'driver' ? driverUserId : undefined,
        third_party_reference: thirdPartyRef,
        updated_at: new Date().toISOString(),
      };
    }));

    const driverName = users.find(u => u.id === driverUserId)?.full_name;
    const desc = assignmentType === 'driver' 
      ? `Assigned to Rider ${driverName || ''}` 
      : assignmentType === 'four_wheeler' 
      ? 'Allocated 4-Wheeler Cab' 
      : 'Booked via Porter / Uber';
    addLog(orderId, 'Vehicle/Delivery Assignment', desc);
  };

  const getOnDutyDriversForDate = (date: string): string[] => {
    return dailyRosters[date] || [];
  };

  const toggleDriverDuty = (driverUserId: string, targetDate?: string) => {
    const dateKey = targetDate || new Date().toISOString().split('T')[0];
    const currentOnDuty = dailyRosters[dateKey] || [];
    const isNowDuty = !currentOnDuty.includes(driverUserId);
    
    const updated = isNowDuty 
      ? [...currentOnDuty, driverUserId] 
      : currentOnDuty.filter(id => id !== driverUserId);

    setDailyRosters(prev => ({
      ...prev,
      [dateKey]: updated,
    }));

    const driver = users.find(u => u.id === driverUserId);
    addLog(
      'ROSTER', 
      `Driver Duty: ${driver?.full_name} (${dateKey})`, 
      isNowDuty ? 'Marked ON DUTY' : 'Marked OFF DUTY (Reverted assigned orders to Unassigned)'
    );

    // If driver is marked OFF duty, automatically unassign any active orders assigned to them on this date!
    if (!isNowDuty) {
      setOrders(prev => prev.map(order => {
        if (
          order.order_type === 'home_delivery' &&
          order.delivery_date === dateKey &&
          order.assigned_delivery_user_id === driverUserId &&
          !['delivered', 'cancelled'].includes(order.status)
        ) {
          return {
            ...order,
            assignment_type: 'unassigned',
            assigned_delivery_user_id: undefined,
            updated_at: new Date().toISOString(),
          };
        }
        return order;
      }));
    }
  };

  const markDelivered = (orderId: string, paymentCollected: number, paymentMode: PaymentMode) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const finalPending = order.payment_status === 'credit' 
        ? order.pending_amount 
        : Math.max(0, order.pending_amount - paymentCollected);
      return {
        ...order,
        status: 'delivered',
        delivery_payment_collected: paymentCollected,
        delivery_payment_mode: paymentMode,
        pending_amount: finalPending,
        payment_status: finalPending <= 0 ? 'paid' : order.payment_status,
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, 'Delivered to Customer', `Collected: ₹${paymentCollected} via ${paymentMode.toUpperCase()}`);
  };

  const markCollected = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'collected',
        pending_amount: order.payment_status === 'credit' ? order.pending_amount : 0,
        payment_status: order.payment_status === 'credit' ? 'credit' : 'paid',
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, 'Outlet Order Collected', 'Customer handed over cake at outlet counter');
  };

  const updateTallySINumber = (orderId: string, tallySINumber: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        tally_si_number: tallySINumber,
        updated_at: new Date().toISOString(),
      };
    }));
    addLog(orderId, 'Tally SI Number Recorded', `Invoice: ${tallySINumber}`);
  };

  const closeDriverDay = (driverUserId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.assigned_delivery_user_id === driverUserId && order.status === 'delivered') {
        return {
          ...order,
          driver_day_closed: true,
          driver_day_closed_at: new Date().toISOString(),
        };
      }
      return order;
    }));
    const driver = users.find(u => u.id === driverUserId);
    addLog('CLOSEOUT', `Driver Day Closed: ${driver?.full_name}`, `Collections settled with Delivery Lead`);
  };

  const closeAdminDayReconciliation = () => {
    setOrders(prev => prev.map(order => {
      if (['delivered', 'collected'].includes(order.status)) {
        return {
          ...order,
          admin_day_reconciled: true,
        };
      }
      return order;
    }));
    addLog('CLOSEOUT', 'Daily Collections Reconciled with Main Cashier', 'All card, UPI, and cash accounts handed over.');
  };

  return (
    <AppContext.Provider value={{
      orders,
      logs,
      currentUser,
      users,
      kitchens,
      pickupLocations,
      setKitchens,
      setPickupLocations,
      addPickupLocation,
      removePickupLocation,
      addKitchen,
      removeKitchen,
      onDutyDrivers,
      getOnDutyDriversForDate,
      settingsConfig,
      updateSettingsConfig,
      setCurrentUserRole,
      setCurrentUser,
      addLog,
      createOrder,
      updateOrder,
      cancelOrder,
      updateOrderStatus,
      updateItemStatus,
      assignVehicleOrDriver,
      toggleDriverDuty,
      markDelivered,
      markCollected,
      updateTallySINumber,
      closeDriverDay,
      closeAdminDayReconciliation,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
