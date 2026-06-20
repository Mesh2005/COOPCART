/**
 * Domain enums (mirroring the Postgres enums) and row shapes used across the app.
 * When a real Supabase project is connected, you can also generate precise types
 * with `supabase gen types typescript` and layer them in.
 */

export const USER_ROLES = ["admin", "manager", "sales", "inventory", "delivery", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STAFF_ROLES = ["admin", "manager", "sales", "inventory", "delivery"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ACCOUNT_STATUSES = ["pending", "approved", "suspended", "rejected"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const BUSINESS_TYPES = ["shop", "bakery", "restaurant", "hotel", "catering", "wholesaler", "other"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const EGG_COLORS = ["brown", "white", "tinted"] as const;
export type EggColor = (typeof EGG_COLORS)[number];

export const SIZE_GRADES = ["small", "medium", "large", "extra_large", "jumbo", "mixed"] as const;
export type SizeGrade = (typeof SIZE_GRADES)[number];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "out_for_delivery",
  "ready_for_pickup",
  "delivered",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["bank_transfer", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["unpaid", "slip_uploaded", "verified", "rejected", "paid_cod"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_TYPES = ["delivery", "pickup"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_user_id: string;
  business_name: string;
  business_type: BusinessType;
  br_number: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  delivery_zone_id: string | null;
  status: AccountStatus;
  cod_limit: number | null;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  egg_color: EggColor;
  size_grade: SizeGrade;
  weight_min_g: number | null;
  weight_max_g: number | null;
  description: string | null;
  image_url: string | null;
  eggs_per_tray: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductPrice {
  id: string;
  product_id: string;
  price_per_tray: number;
  effective_from: string;
  set_by: string | null;
}

export interface PriceTier {
  id: string;
  product_id: string;
  min_qty_trays: number;
  max_qty_trays: number | null;
  price_per_tray: number;
  is_custom_quote: boolean;
  created_at: string;
}

export interface Inventory {
  product_id: string;
  trays_on_hand: number;
  trays_reserved: number;
  low_stock_threshold: number;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  base_fee: number;
  per_tray_fee: number;
  delivery_days: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  delivery_zone_id: string | null;
  delivery_address: string | null;
  scheduled_date: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  customer_note: string | null;
  internal_note: string | null;
  assigned_delivery_user_id: string | null;
  placed_at: string;
  confirmed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  grade_snapshot: string | null;
  weight_range_snapshot: string | null;
  unit_price_snapshot: number;
  qty_trays: number;
  line_total: number;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  slip_url: string | null;
  reference: string | null;
  uploaded_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  account_name: string;
  bank_name: string;
  branch: string | null;
  account_number: string;
  instructions: string | null;
  is_active: boolean;
}

export interface AppSettings {
  id: boolean;
  order_cutoff_time: string;
  min_order_trays: number;
  currency: string;
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;
  timezone: string;
  default_locale: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
