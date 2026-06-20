"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_settings").update({
    min_order_trays: parseInt(formData.get("minOrderTrays") as string, 10),
    order_cutoff_time: formData.get("cutoffTime") as string,
    cod_enabled: formData.get("codEnabled") === "true",
    bank_transfer_enabled: formData.get("bankTransferEnabled") === "true",
    contact_phone: (formData.get("contactPhone") as string) || null,
    contact_email: (formData.get("contactEmail") as string) || null,
    contact_address: (formData.get("contactAddress") as string) || null,
  }).eq("id", true);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/app/checkout");
  return { success: "Settings saved." };
}

export async function upsertBankAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = (formData.get("id") as string) || null;
  const payload = {
    account_name: formData.get("accountName") as string,
    bank_name: formData.get("bankName") as string,
    branch: (formData.get("branch") as string) || null,
    account_number: formData.get("accountNumber") as string,
    instructions: (formData.get("instructions") as string) || null,
    is_active: formData.get("isActive") === "true",
  };
  if (!payload.account_name || !payload.bank_name || !payload.account_number)
    return { error: "Account name, bank name, and account number are required." };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("bank_accounts").update(payload).eq("id", id)
    : await supabase.from("bank_accounts").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/app/checkout");
  return { success: "Bank account saved." };
}

export async function upsertDeliveryZoneAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = (formData.get("id") as string) || null;
  const deliveryDays = formData.getAll("deliveryDays") as string[];
  const payload = {
    name: formData.get("name") as string,
    base_fee: parseFloat(formData.get("baseFee") as string),
    per_tray_fee: parseFloat(formData.get("perTrayFee") as string),
    delivery_days: deliveryDays,
    is_active: formData.get("isActive") !== "false",
  };
  if (!payload.name) return { error: "Zone name is required." };
  if (isNaN(payload.base_fee) || isNaN(payload.per_tray_fee))
    return { error: "Fees must be valid numbers." };

  const supabase = await createSupabaseServerClient();
  const { error } = id
    ? await supabase.from("delivery_zones").update(payload).eq("id", id)
    : await supabase.from("delivery_zones").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/app/checkout");
  return { success: "Delivery zone saved." };
}

export async function addBlackoutDateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const date = formData.get("date") as string;
  const reason = (formData.get("reason") as string) || null;
  if (!date) return { error: "Date is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("delivery_blackouts")
    .insert({ date, reason });
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { success: "Blackout date added." };
}

export async function removeBlackoutDateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id") as string;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("delivery_blackouts")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { success: "Blackout date removed." };
}
