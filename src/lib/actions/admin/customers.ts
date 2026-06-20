"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";
import type { AccountStatus } from "@/lib/types";

async function setBusinessStatus(
  businessId: string,
  status: AccountStatus,
  notes?: string,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = { status };
  if (status === "approved") {
    update.approved_at = new Date().toISOString();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    update.approved_by = user?.id ?? null;
  }
  if (notes !== undefined) update.notes = notes;
  const { error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", businessId);
  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  return { success: `Business ${status}.` };
}

export async function approveBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return setBusinessStatus(formData.get("businessId") as string, "approved");
}

export async function rejectBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const notes = (formData.get("notes") as string) || "Application rejected.";
  return setBusinessStatus(
    formData.get("businessId") as string,
    "rejected",
    notes,
  );
}

export async function suspendBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const notes = formData.get("notes") as string;
  return setBusinessStatus(
    formData.get("businessId") as string,
    "suspended",
    notes,
  );
}

export async function updateCodLimitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = formData.get("businessId") as string;
  const limit = parseFloat(formData.get("codLimit") as string);
  if (isNaN(limit) || limit < 0)
    return { error: "Invalid COD limit." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("businesses")
    .update({ cod_limit: limit })
    .eq("id", businessId);
  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  return { success: "COD limit updated." };
}
