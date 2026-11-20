'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Order, 
  UserProfile, 
  Kitchen, 
  PickupLocation, 
  OrderStatus, 
  ItemStatus, 
  OrderLog, 
  DeliveryPricingConfig,
  AssignmentType,
  PaymentMode
} from '@/types';
import { initialOrders, mockUsers, mockKitchens, mockPickupLocations, initialLogs } from '@/lib/mockData';
import { defaultPricingConfig } from '@/lib/deliveryPricing';

interface AppContextType {
  orders: Order[];
  logs: OrderLog[];
  currentUser: UserProfile;
  users: UserProfile[];
  kitchens: Kitchen[];
  pickupLocations: PickupLocation[];
  onDutyDrivers: string[]; // driver user ids
  pricingConfig: DeliveryPricingConfig;
  updatePricingConfig: (config: DeliveryPricingConfig) => void;
  setCurrentUserRole: (role: UserProfile['role']) => void;
  setCurrentUser: (user: UserProfile) => void;
  addLog: (orderId: string, action: string, details?: string) => void;
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'pending_amount'>) => void;
  updateOrder: (orderId: string, updatedFields: Partial<Order>, editSummary?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: Partial<Order>, actionNote?: string) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus, kitchenId?: string, photoUrl?: string) => void;
  assignVehicleOrDriver: (orderId: string, assignmentType: AssignmentType, driverUserId?: string, thirdPartyRef?: string) => void;
  toggleDriverDuty: (driverUserId: string) => void;
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
      const saved = localStorage.getItem('ambrosia_orders_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return initialOrders;
  });

  const [logs, setLogs] = useState<OrderLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_logs_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return initialLogs;
  });

  const [pricingConfig, setPricingConfig] = useState<DeliveryPricingConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_pricing_config');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return defaultPricingConfig;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]);
  const [users] = useState<UserProfile[]>(mockUsers);
  const [kitchens] = useState<Kitchen[]>(mockKitchens);
  const [pickupLocations] = useState<PickupLocation[]>(mockPickupLocations);
  const [onDutyDrivers, setOnDutyDrivers] = useState<string[]>(['u5', 'u6']); // Deepu & Suresh on duty

  useEffect(() => {
    localStorage.setItem('ambrosia_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ambrosia_logs_v2', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('ambrosia_pricing_config', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  const updatePricingConfig = (newConfig: DeliveryPricingConfig) => {
    setPricingConfig(newConfig);
    addLog('SYSTEM', 'Delivery Pricing Updated', `Free: ${newConfig.freeRadiusKm}km, 1st: ₹${newConfig.firstExtraKmCharge}, +km: ₹${newConfig.perExtraKmCharge}`);
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
    addLog(id, 'Order Created', `Tally SO: ${newOrder.tally_so_number} for ${newOrder.customer_name} (Payment: ${newOrder.payment_status.toUpperCase()})`);
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

  const toggleDriverDuty = (driverUserId: string) => {
    const isNowDuty = !onDutyDrivers.includes(driverUserId);
    setOnDutyDrivers(prev => 
      isNowDuty ? [...prev, driverUserId] : prev.filter(id => id !== driverUserId)
    );
    const driver = users.find(u => u.id === driverUserId);
    addLog('ROSTER', `Driver Duty: ${driver?.full_name}`, isNowDuty ? 'Marked ON DUTY' : 'Marked OFF DUTY');
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
      onDutyDrivers,
      pricingConfig,
      updatePricingConfig,
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
