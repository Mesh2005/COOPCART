"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUSINESS_TYPES, STAFF_ROLES } from "@/lib/types";
import { createOtp, verifyOtp } from "@/lib/otp";
import { sendOtpEmail, hasEmailProvider } from "@/lib/email";
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
  const { data: signIn, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Supabase reports unconfirmed emails here when confirmation is required.
    if (/email not confirmed|not confirmed/i.test(error.message)) {
      return { error: "Please verify your email before logging in." };
    }
    return { error: error.message };
  }

  // Only email-verified accounts may sign in.
  if (signIn.user && !signIn.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { error: "Please verify your email before logging in." };
  }

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

function parseRegistration(formData: FormData) {
  return registerSchema.safeParse({
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
}

function fieldErrorsFrom(issues: z.ZodIssue[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Step 1 of registration: validate the business details, ensure the email is
 * free, then email a 6-digit verification code. The account is NOT created
 * yet — registerAction (step 2) does that once the code is confirmed.
 */
export async function requestSignupOtp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseRegistration(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const d = parsed.data;
  const admin = createSupabaseAdminClient();

  // Reject emails that already have an account.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", d.email.toLowerCase())
    .maybeSingle();
  if (existing) {
    return {
      error: "An account with this email already exists. Try logging in instead.",
      fieldErrors: { email: "Email already in use" },
    };
  }

  const code = await createOtp(d.email);
  const sent = await sendOtpEmail(d.email, code);

  if (sent.delivered) {
    return { otpSent: true, success: `We sent a 6-digit code to ${d.email}.` };
  }
  if (!hasEmailProvider) {
    // No email service configured — surface the code so the flow is testable.
    return {
      otpSent: true,
      devCode: code,
      success: `Email isn't configured yet, so here's your code for testing: ${code}`,
    };
  }
  return { error: sent.error ?? "Could not send the verification email. Please try again." };
}

/**
 * Step 2 of registration: verify the emailed OTP, then create the auth user,
 * the pending business, and sign the customer in.
 */
export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseRegistration(formData);
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const d = parsed.data;

  // Verify the emailed code first.
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { otpSent: true, error: "Enter the 6-digit code from your email." };
  }
  const check = await verifyOtp(d.email, code);
  if (!check.ok) {
    const msg =
      check.reason === "mismatch"
        ? "That code is incorrect. Please try again."
        : check.reason === "expired"
          ? "That code has expired. Request a new one."
          : check.reason === "too_many"
            ? "Too many attempts. Request a new code."
            : "Please request a verification code first.";
    return { otpSent: true, error: msg };
  }

  const admin = createSupabaseAdminClient();

  // Create the auth user via the service role, pre-confirmed — the email was
  // already verified by the OTP step above. The handle_new_user trigger
  // creates the matching profiles row (role=customer).
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

export async function signOutAction(formData?: FormData) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const to = String(formData?.get("redirectTo") ?? "/login");
  redirect(to.startsWith("/") ? to : "/login");
}
