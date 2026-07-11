"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { getCart } from "@/lib/data/cart";
import { formatLKR } from "@/lib/format";
import { sendOrderConfirmationEmail } from "@/lib/email";
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

  // Enforce the business's cash-on-delivery credit limit (if one is set).
  if (paymentMethod === "cod") {
    const business = await getMyBusiness();
    if (business?.cod_limit != null) {
      const cart = await getCart();
      if (cart.subtotal > business.cod_limit) {
        return {
          error: `Your cash-on-delivery limit is ${formatLKR(
            business.cod_limit,
          )}. This order (${formatLKR(
            cart.subtotal,
          )}) is over it — please pay by bank transfer instead.`,
        };
      }
    }
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

  // Order-confirmation email (best-effort — never blocks the order).
  const orderId = data as string;
  try {
    const business = await getMyBusiness();
    if (business?.email) {
      const { data: o } = await supabase
        .from("orders")
        .select("order_number, total, fulfillment_type, scheduled_date, payment_method")
        .eq("id", orderId)
        .single();
      if (o) {
        await sendOrderConfirmationEmail(business.email, {
          id: orderId,
          orderNumber: o.order_number,
          total: o.total,
          fulfillment: o.fulfillment_type,
          date: o.scheduled_date,
          paymentMethod: o.payment_method,
        });
      }
    }
  } catch {
    // ignore email failures
  }

  redirect(`/app/orders/${orderId}?placed=1`);
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
