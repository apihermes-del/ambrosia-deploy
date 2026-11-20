export type UserRole = 
  | 'super_admin'
  | 'customer_care'
  | 'cake_setting'
  | 'delivery'
  | 'delivery_lead'
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
export type PaymentStatus = 'paid' | 'partial' | 'pending_cod' | 'credit';
export type PaymentMode = 'cash' | 'upi_qr' | 'card' | 'online' | 'none';

export type AssignmentType = 'driver' | 'porter_uber' | 'four_wheeler' | 'unassigned';

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
  special_instructions?: string;
  lead_time_minutes: number;
  kitchen_id?: string;
  status: ItemStatus;
  photo_url?: string;
  ready_at?: string;
}

export interface OrderLog {
  id: string;
  order_id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  details?: string;
}

export interface DeliveryPricingConfig {
  freeRadiusKm: number;
  firstExtraKmCharge: number;
  perExtraKmCharge: number;
  bakeryAddress: string;
  bakeryCoordinates: {
    lat: number;
    lng: number;
  };
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
  delivery_pincode?: string;
  google_maps_link?: string;
  delivery_distance_km?: number;
  delivery_charge?: number;
  delivery_date: string;
  delivery_time_slot: string;
  target_delivery_time: string;
  status: OrderStatus;
  
  // Assignment details
  assignment_type: AssignmentType;
  assigned_delivery_user_id?: string; // driver ID if assignment_type === 'driver'
  third_party_reference?: string;    // e.g. Porter booking ID or 4-wheeler driver note
  
  pickup_location_id?: string;
  total_amount: number;
  advance_paid: number;
  pending_amount: number;
  payment_status: PaymentStatus;
  delivery_payment_collected?: number;
  delivery_payment_mode?: PaymentMode;
  special_notes?: string;
  
  is_edited_flag?: boolean; // Flagged when customer care modifies an active order
  edited_summary?: string;
  
  // Day closeout flags
  driver_day_closed?: boolean;
  driver_day_closed_at?: string;
  admin_day_reconciled?: boolean;
  
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
