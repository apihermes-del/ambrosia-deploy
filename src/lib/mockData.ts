import { UserProfile, Kitchen, PickupLocation, Order } from '@/types';

export const mockUsers: UserProfile[] = [
  { id: 'u1', full_name: 'Priya Sharma (Admin)', phone_number: '+91 98765 43210', role: 'super_admin', is_active: true },
  { id: 'u2', full_name: 'Kavita Desk', phone_number: '+91 98765 43211', role: 'customer_care', is_active: true },
  { id: 'u3', full_name: 'Chef Anil (Setting)', phone_number: '+91 98765 43212', role: 'cake_setting', is_active: true },
  { id: 'u4', full_name: 'Chef Ramesh (Setting)', phone_number: '+91 98765 43213', role: 'cake_setting', is_active: true },
  { id: 'u5', full_name: 'Rohan Delivery', phone_number: '+91 98765 43214', role: 'delivery', is_active: true },
  { id: 'u6', full_name: 'Suresh Delivery', phone_number: '+91 98765 43215', role: 'delivery', is_active: true },
  { id: 'u7', full_name: 'Vikram Delivery', phone_number: '+91 98765 43216', role: 'delivery', is_active: true },
  { id: 'u8', full_name: 'Deepak Delivery', phone_number: '+91 98765 43217', role: 'delivery', is_active: true },
];

export const mockKitchens: Kitchen[] = [
  { id: 'k1', name: 'Kitchen 1 - Base Sponge & Baking', description: 'Handles base sponge, chocolate, vanilla baking', is_active: true },
  { id: 'k2', name: 'Kitchen 2 - Setting, Icing & Custom Decor', description: 'Whipping, icing, fondant art, photo print', is_active: true },
  { id: 'k3', name: 'Kitchen 3 - Pastries & Desserts', description: 'Dry tea cakes, cupcakes, cookies', is_active: true },
];

export const mockPickupLocations: PickupLocation[] = [
  { id: 'loc1', name: 'Cake Section Chiller (Dispatch)', category: 'cake_section', is_active: true },
  { id: 'loc2', name: 'Outlet Chiller 1 (Left)', category: 'outlet_chiller', is_active: true },
  { id: 'loc3', name: 'Outlet Chiller 2 (Right)', category: 'outlet_chiller', is_active: true },
  { id: 'loc4', name: 'Outlet Counter Display', category: 'outlet_counter', is_active: true },
];

// Helper to format ISO target time relative to today
const getTargetTime = (hoursFromNow: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d.toISOString();
};

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    tally_so_number: 'SO-2026-0891',
    order_type: 'home_delivery',
    customer_name: 'Meera Nambiar',
    customer_phone: '+91 98450 12345',
    customer_alt_phone: '+91 98450 99887',
    delivery_area: 'Indiranagar 100ft Road',
    delivery_address: '#452, 2nd Cross, 100ft Road, Opp Costa Coffee, Indiranagar',
    delivery_landmark: 'Opp Costa Coffee',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time_slot: '14:00 - 16:00',
    target_delivery_time: getTargetTime(2), // 2 hours from now -> Due for setting!
    status: 'new',
    total_amount: 1450,
    advance_paid: 1000,
    pending_amount: 450,
    payment_status: 'partial',
    special_notes: 'Please add 1 box of golden candles and handle with extra care.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'itm-1',
        order_id: 'ord-101',
        item_name: 'Dutch Chocolate Truffle Cake',
        category: 'Cakes',
        size_or_weight: '1.5 kg',
        quantity: 1,
        cake_message: 'Happy 10th Anniversary Rahul & Meera!',
        egg_preference: 'eggless',
        special_instructions: 'Dark chocolate drip on sides',
        lead_time_minutes: 120,
        status: 'pending',
      },
      {
        id: 'itm-2',
        order_id: 'ord-101',
        item_name: 'Chocolate Cupcakes (Box of 4)',
        category: 'Desserts',
        size_or_weight: '4 pcs',
        quantity: 1,
        egg_preference: 'eggless',
        lead_time_minutes: 60,
        status: 'pending',
      }
    ]
  },
  {
    id: 'ord-102',
    tally_so_number: 'SO-2026-0892',
    order_type: 'outlet_pickup',
    customer_name: 'Arjun Verma',
    customer_phone: '+91 99801 55667',
    delivery_area: 'Ambrosia Outlet Pick up',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time_slot: '16:00 - 18:00',
    target_delivery_time: getTargetTime(4),
    status: 'preparing',
    pickup_location_id: 'loc2',
    total_amount: 980,
    advance_paid: 980,
    pending_amount: 0,
    payment_status: 'paid',
    special_notes: 'Will be collected by customer sister.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'itm-3',
        order_id: 'ord-102',
        item_name: 'Fresh Mango Cream Cake',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: 'Happy Birthday Papa!',
        egg_preference: 'eggless',
        lead_time_minutes: 120,
        kitchen_id: 'k2',
        status: 'preparing',
      }
    ]
  },
  {
    id: 'ord-103',
    tally_so_number: 'SO-2026-0888',
    order_type: 'home_delivery',
    customer_name: 'Dr. Sunita Rao',
    customer_phone: '+91 97412 88990',
    delivery_area: 'Koramangala 4th Block',
    delivery_address: 'Flat 302, Prestige Palms, 8th Main, Koramangala 4th Block',
    delivery_landmark: 'Near Wipro Park',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time_slot: '12:00 - 14:00',
    target_delivery_time: getTargetTime(1),
    status: 'ready_for_pickup',
    pickup_location_id: 'loc1',
    assigned_delivery_user_id: 'u5',
    total_amount: 2200,
    advance_paid: 1500,
    pending_amount: 700,
    payment_status: 'partial',
    special_notes: 'Call before reaching gate.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'itm-4',
        order_id: 'ord-103',
        item_name: 'Red Velvet Cheese Cake',
        category: 'Cakes',
        size_or_weight: '2 kg',
        quantity: 1,
        cake_message: 'Congratulations Dr. Sunita!',
        egg_preference: 'with_egg',
        lead_time_minutes: 180,
        kitchen_id: 'k2',
        status: 'ready',
        ready_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'ord-104',
    tally_so_number: 'SO-2026-0880',
    order_type: 'outlet_pickup',
    customer_name: 'Ananya Roy',
    customer_phone: '+91 98200 44551',
    delivery_area: 'Ambrosia Outlet Pick up',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_time_slot: '11:00 - 13:00',
    target_delivery_time: getTargetTime(-0.5),
    status: 'ready_for_pickup',
    pickup_location_id: 'loc2',
    total_amount: 1200,
    advance_paid: 1200,
    pending_amount: 0,
    payment_status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'itm-5',
        order_id: 'ord-104',
        item_name: 'Classic Black Forest Cake',
        category: 'Cakes',
        size_or_weight: '1 kg',
        quantity: 1,
        cake_message: 'Best Mom Ever',
        egg_preference: 'eggless',
        lead_time_minutes: 120,
        kitchen_id: 'k2',
        status: 'ready',
        ready_at: new Date().toISOString(),
      }
    ]
  }
];
