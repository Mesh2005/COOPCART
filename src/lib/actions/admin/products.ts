"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const isActive = formData.get("isActive") === "true";

  if (!name) return { error: "Product name is required." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ name, description, is_active: isActive })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: "Product updated." };
}

export async function setPriceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("productId") as string;
  const price = parseFloat(formData.get("price") as string);
  if (isNaN(price) || price <= 0) return { error: "Invalid price." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("product_prices").insert({
    product_id: productId,
    price_per_tray: price,
    set_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/app/catalog");
  return { success: "Price updated." };
}

export async function upsertTierAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tierId = (formData.get("tierId") as string) || null;
  const productId = formData.get("productId") as string;
  const minQty = parseInt(formData.get("minQty") as string, 10);
  const maxQty = formData.get("maxQty")
    ? parseInt(formData.get("maxQty") as string, 10)
    : null;
  const tierPrice = parseFloat(formData.get("tierPrice") as string);

  if (isNaN(minQty) || minQty <= 0) return { error: "Invalid min quantity." };
  if (isNaN(tierPrice) || tierPrice <= 0) return { error: "Invalid price." };

  const supabase = await createSupabaseServerClient();
  const payload = {
    product_id: productId,
    min_qty_trays: minQty,
    max_qty_trays: maxQty,
    price_per_tray: tierPrice,
    is_custom_quote: false,
  };

  const { error } = tierId
    ? await supabase.from("price_tiers").update(payload).eq("id", tierId)
    : await supabase.from("price_tiers").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: "Tier saved." };
}

export async function deleteTierAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tierId = formData.get("tierId") as string;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("price_tiers")
    .delete()
    .eq("id", tierId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: "Tier deleted." };
}

export async function toggleProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = formData.get("productId") as string;
  const isActive = formData.get("isActive") === "true";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/app/catalog");
  return { success: isActive ? "Product activated." : "Product deactivated." };
}
