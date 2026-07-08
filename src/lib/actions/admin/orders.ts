"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";
import type { OrderStatus } from "@/lib/types";

export async function setOrderStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("newStatus") as OrderStatus;
  const note = (formData.get("note") as string) || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: orderId,
    p_new: newStatus,
    p_note: note,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: `Order moved to ${newStatus}.` };
}

export async function updateInternalNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const orderId = formData.get("orderId") as string;
  const note = formData.get("note") as string;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ internal_note: note })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: "Note saved." };
}

export async function assignDeliveryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const orderId = formData.get("orderId") as string;
  const userId = formData.get("userId") as string;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("assign_delivery", {
    p_order_id: orderId,
    p_user: userId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: "Delivery assigned." };
}
