export type UserRole = 
  | 'super_admin'
  | 'customer_care'
  | 'cake_setting'
  | 'delivery'
  | 'outlet';

export type OrderType = 'home_delivery' | 'outlet_pickup';

export type OrderStatus = 
  | 'new'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'collected'
  | 'cancelled';

export type ItemStatus = 'pending' | 'preparing' | 'ready';
export type PaymentStatus = 'paid' | 'partial' | 'pending_cod';
export type PaymentMode = 'cash' | 'upi_qr' | 'card' | 'online' | 'none';

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
}

export interface Kitchen {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface PickupLocation {
  id: string;
  name: string;
  category: 'cake_section' | 'outlet_chiller' | 'outlet_counter';
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_name: string;
  category: string;
  size_or_weight: string;
  quantity: number;
  cake_message?: string;
  egg_preference: 'eggless' | 'with_egg';
  special_instructions?: string;
  lead_time_minutes: number;
  kitchen_id?: string;
  status: ItemStatus;
  photo_url?: string;
  ready_at?: string;
}

export interface Order {
  id: string;
  tally_so_number: string;
  tally_si_number?: string;
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  customer_alt_phone?: string;
  delivery_area: string;
  delivery_address?: string;
  delivery_landmark?: string;
  google_maps_link?: string;
  delivery_date: string;
  delivery_time_slot: string;
  target_delivery_time: string;
  status: OrderStatus;
  assigned_delivery_user_id?: string;
  pickup_location_id?: string;
  total_amount: number;
  advance_paid: number;
  pending_amount: number;
  payment_status: PaymentStatus;
  delivery_payment_collected?: number;
  delivery_payment_mode?: PaymentMode;
  special_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  // Joined fields
  assigned_driver?: UserProfile;
  pickup_location?: PickupLocation;
}
