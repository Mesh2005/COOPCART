import type { BusinessType, OrderStatus, PaymentStatus, SizeGrade } from "@/lib/types";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  shop: "Retail shop",
  bakery: "Bakery",
  restaurant: "Restaurant",
  hotel: "Hotel",
  catering: "Catering service",
  wholesaler: "Wholesaler",
  other: "Other",
};

export const SIZE_GRADE_LABELS: Record<SizeGrade, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
  extra_large: "Extra Large",
  jumbo: "Jumbo",
  mixed: "Mixed",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  slip_uploaded: "Slip uploaded",
  verified: "Verified",
  rejected: "Rejected",
  paid_cod: "Paid (COD)",
};
