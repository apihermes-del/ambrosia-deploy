'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, UserProfile, Kitchen, PickupLocation, OrderStatus, ItemStatus } from '@/types';
import { initialOrders, mockUsers, mockKitchens, mockPickupLocations } from '@/lib/mockData';

interface AppContextType {
  orders: Order[];
  currentUser: UserProfile;
  users: UserProfile[];
  kitchens: Kitchen[];
  pickupLocations: PickupLocation[];
  onDutyDrivers: string[]; // driver user ids
  setCurrentUserRole: (role: UserProfile['role']) => void;
  setCurrentUser: (user: UserProfile) => void;
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'pending_amount'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, additionalData?: Partial<Order>) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus, kitchenId?: string, photoUrl?: string) => void;
  assignDeliveryBoy: (orderId: string, driverUserId: string) => void;
  toggleDriverDuty: (driverUserId: string) => void;
  markDelivered: (orderId: string, paymentCollected: number, paymentMode: Order['delivery_payment_mode']) => void;
  markCollected: (orderId: string) => void;
  updateTallySINumber: (orderId: string, tallySINumber: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ambrosia_orders');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return initialOrders;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]);
  const [users] = useState<UserProfile[]>(mockUsers);
  const [kitchens] = useState<Kitchen[]>(mockKitchens);
  const [pickupLocations] = useState<PickupLocation[]>(mockPickupLocations);
  const [onDutyDrivers, setOnDutyDrivers] = useState<string[]>(['u5', 'u6']); // Default Rohan & Suresh on duty

  useEffect(() => {
    localStorage.setItem('ambrosia_orders', JSON.stringify(orders));
  }, [orders]);

  const setCurrentUserRole = (role: UserProfile['role']) => {
    const found = users.find(u => u.role === role);
    if (found) setCurrentUser(found);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'pending_amount'>) => {
    const id = `ord-${Date.now()}`;
    const pending_amount = Math.max(0, orderData.total_amount - orderData.advance_paid);
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
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, additionalData?: Partial<Order>) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status,
        ...(additionalData || {}),
        updated_at: new Date().toISOString(),
      };
    }));
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

      // If all items are ready, check if whole order should suggest ready_for_pickup
      const allReady = updatedItems.every(i => i.status === 'ready');
      const shouldMoveOrder = allReady && (order.status === 'new' || order.status === 'preparing');

      return {
        ...order,
        items: updatedItems,
        ...(shouldMoveOrder ? { status: 'ready_for_pickup' } : {}),
        updated_at: new Date().toISOString(),
      };
    }));
  };

  const assignDeliveryBoy = (orderId: string, driverUserId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        assigned_delivery_user_id: driverUserId,
        updated_at: new Date().toISOString(),
      };
    }));
  };

  const toggleDriverDuty = (driverUserId: string) => {
    setOnDutyDrivers(prev => 
      prev.includes(driverUserId) 
        ? prev.filter(id => id !== driverUserId)
        : [...prev, driverUserId]
    );
  };

  const markDelivered = (orderId: string, paymentCollected: number, paymentMode: Order['delivery_payment_mode']) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const finalPending = Math.max(0, order.pending_amount - paymentCollected);
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
  };

  const markCollected = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        status: 'collected',
        pending_amount: 0,
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      };
    }));
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
  };

  return (
    <AppContext.Provider value={{
      orders,
      currentUser,
      users,
      kitchens,
      pickupLocations,
      onDutyDrivers,
      setCurrentUserRole,
      setCurrentUser,
      createOrder,
      updateOrderStatus,
      updateItemStatus,
      assignDeliveryBoy,
      toggleDriverDuty,
      markDelivered,
      markCollected,
      updateTallySINumber,
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
