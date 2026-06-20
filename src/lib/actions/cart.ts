"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: boolean; error?: string };

/** Set (or add/update) the tray quantity for a product in the cart. qty<=0 removes it. */
export async function setCartQty(productId: string, qty: number): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in." };

  if (qty <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .upsert(
        { user_id: user.id, product_id: productId, qty_trays: qty },
        { onConflict: "user_id,product_id" },
      );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/app/catalog");
  revalidatePath("/app/cart");
  return { ok: true };
}

export async function removeFromCart(productId: string): Promise<Result> {
  return setCartQty(productId, 0);
}

export async function clearCart(): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in." };
  const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/cart");
  return { ok: true };
}
