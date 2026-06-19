"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "./state";

export async function placeOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fulfillment = String(formData.get("fulfillment") ?? "");
  const zoneId = formData.get("zoneId") ? String(formData.get("zoneId")) : null;
  const address = formData.get("address") ? String(formData.get("address")) : null;
  const scheduledDate = formData.get("scheduledDate") ? String(formData.get("scheduledDate")) : null;
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const note = formData.get("note") ? String(formData.get("note")) : null;

  if (fulfillment !== "delivery" && fulfillment !== "pickup") {
    return { error: "Please choose delivery or pickup." };
  }
  if (fulfillment === "delivery" && (!zoneId || !address)) {
    return { error: "Select a delivery zone and enter your address." };
  }
  if (!scheduledDate) {
    return { error: `Please choose a ${fulfillment === "delivery" ? "delivery" : "pickup"} date.` };
  }
  if (paymentMethod !== "bank_transfer" && paymentMethod !== "cod") {
    return { error: "Please choose a payment method." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_fulfillment: fulfillment,
    p_zone_id: zoneId,
    p_address: address,
    p_scheduled_date: scheduledDate,
    p_payment_method: paymentMethod,
    p_customer_note: note,
  });

  if (error) return { error: error.message };

  redirect(`/app/orders/${data as string}?placed=1`);
}

export async function uploadSlip(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const orderId = String(formData.get("orderId") ?? "");
  const file = formData.get("slip");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a file to upload." };
  if (file.size > 5 * 1024 * 1024) return { error: "File is too large (max 5 MB)." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in." };

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${user.id}/${orderId}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("payment-slips")
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (upErr) return { error: upErr.message };

  const { error: rpcErr } = await supabase.rpc("upload_payment_slip", {
    p_order_id: orderId,
    p_url: path,
  });
  if (rpcErr) return { error: rpcErr.message };

  revalidatePath(`/app/orders/${orderId}`);
  return { success: "Payment slip uploaded — we’ll verify it shortly." };
}
