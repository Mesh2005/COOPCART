"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";

export async function addProductionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("productId") as string;
  const trays = parseInt(formData.get("trays") as string, 10);
  const note = (formData.get("note") as string) || null;

  if (!productId) return { error: "Product is required." };
  if (isNaN(trays) || trays <= 0) return { error: "Trays must be a positive number." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("add_production", {
    product_id: productId,
    trays,
    note,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: `Added ${trays} trays to stock.` };
}

export async function adjustStockAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("productId") as string;
  const delta = parseInt(formData.get("delta") as string, 10);
  const note = (formData.get("note") as string) || null;

  if (!productId) return { error: "Product is required." };
  if (isNaN(delta) || delta === 0)
    return { error: "Adjustment must be a non-zero number." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("adjust_stock", {
    product_id: productId,
    delta,
    note,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: `Stock adjusted by ${delta > 0 ? "+" : ""}${delta} trays.` };
}
