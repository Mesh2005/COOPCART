"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_TYPES } from "@/lib/types";
import type { ActionState } from "./state";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Please enter a valid email and password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const next = String(formData.get("next") ?? "/app");
  redirect(next.startsWith("/") ? next : "/app");
}

const registerSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  phone: z.string().min(7, "Enter a valid phone number"),
  businessName: z.string().min(2, "Enter your business name"),
  businessType: z.enum(BUSINESS_TYPES as unknown as [string, ...string[]]),
  brNumber: z.string().optional(),
  addressLine1: z.string().min(3, "Enter your address"),
  city: z.string().min(2, "Enter your city"),
});

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    businessName: String(formData.get("businessName") ?? ""),
    businessType: String(formData.get("businessType") ?? "other"),
    brNumber: String(formData.get("brNumber") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    city: String(formData.get("city") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: d.email,
    password: d.password,
    options: { data: { full_name: d.fullName, phone: d.phone } },
  });
  if (signUpError) return { error: signUpError.message };

  const userId = signUp.user?.id;
  if (!userId) return { error: "Could not create your account. Please try again." };

  // Service-role insert so the business is created reliably even before the
  // email is confirmed / a session exists.
  const admin = createSupabaseAdminClient();
  const { error: bizError } = await admin.from("businesses").insert({
    owner_user_id: userId,
    business_name: d.businessName,
    business_type: d.businessType,
    br_number: d.brNumber || null,
    contact_person: d.fullName,
    phone: d.phone,
    email: d.email,
    address_line1: d.addressLine1,
    city: d.city,
    status: "pending",
  });
  if (bizError) return { error: bizError.message };

  if (signUp.session) redirect("/app");
  redirect("/login?status=registered");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
