"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendPaymentVerifiedEmail } from "@/lib/email";
import type { ActionState } from "@/lib/actions/state";

export async function verifyPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const paymentId = formData.get("paymentId") as string;
  const approve = formData.get("action") === "approve";
  const reason = (formData.get("reason") as string | null) || null;

  if (!approve && !reason) {
    return { error: "Please provide a reason for rejection." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("verify_payment", {
    p_payment_id: paymentId,
    p_approve: approve,
    p_reason: reason,
  });

  if (error) return { error: error.message };

  // Notify the customer by email that their payment was verified.
  if (approve) {
    try {
      const { data: info } = await supabase
        .from("payments")
        .select("orders(id, order_number, businesses(email))")
        .eq("id", paymentId)
        .single();
      const order = (info as unknown as { orders?: { id: string; order_number: string; businesses?: { email?: string } } })?.orders;
      if (order?.businesses?.email) {
        await sendPaymentVerifiedEmail(order.businesses.email, {
          id: order.id,
          orderNumber: order.order_number,
        });
      }
    } catch {
      // ignore email failures
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  return { success: approve ? "Payment verified." : "Payment rejected." };
}
