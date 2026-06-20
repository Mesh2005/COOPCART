"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    payment_id: paymentId,
    approve,
    reason,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  return { success: approve ? "Payment verified." : "Payment rejected." };
}
