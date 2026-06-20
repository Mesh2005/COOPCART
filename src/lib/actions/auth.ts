"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_TYPES, STAFF_ROLES } from "@/lib/types";
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

  // Customer login always lands in the customer portal. (Staff who sign in
  // here are bounced to /admin by the /app layout guard.) An explicit
  // /app deep-link is respected.
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/app") ? next : "/app");
}

/**
 * Staff-only login for the admin console. Rejects (and signs out) any
 * account that does not hold a staff role so customers can't reach /admin.
 */
export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Please enter a valid email and password." };

  const supabase = await createSupabaseServerClient();
  const { data: signIn, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signIn.user!.id)
    .maybeSingle();

  if (!prof || !(STAFF_ROLES as readonly string[]).includes(prof.role)) {
    await supabase.auth.signOut();
    return {
      error:
        "This account isn’t authorised for the admin console. Please use the customer login.",
    };
  }

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && next !== "/admin/login" ? next : "/admin");
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
  const admin = createSupabaseAdminClient();

  // Create the auth user via the service role, pre-confirmed. (This deployment
  // has no transactional email configured, so we confirm immediately rather
  // than leave accounts stuck waiting on a verification link.) The
  // handle_new_user trigger creates the matching profiles row (role=customer).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { full_name: d.fullName, phone: d.phone },
  });
  if (createErr) {
    const exists = /already|registered|exists/i.test(createErr.message);
    return {
      error: exists
        ? "An account with this email already exists. Try logging in instead."
        : createErr.message,
      ...(exists ? { fieldErrors: { email: "Email already in use" } } : {}),
    };
  }
  const userId = created.user.id;

  // Insert the business (service role bypasses RLS). If this fails, roll back
  // the orphaned auth user so the form can be safely resubmitted.
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
  if (bizError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: bizError.message };
  }

  // Sign the new customer in and take them to the portal (pending review).
  const supabase = await createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: d.email,
    password: d.password,
  });
  if (signInErr) redirect("/login?status=registered");
  redirect("/app");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
