"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";
import { STAFF_ROLES, type StaffRole } from "@/lib/types";

/** A readable random temporary password (mixed case + digits, no lookalikes). */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `Cc${s}`;
}

/**
 * Add a staff member (any role, including admin). Creates an email-confirmed
 * account with a temporary password so the person can sign in immediately — no
 * invite email required. If the email already has an account it is promoted to
 * the chosen role instead.
 */
export async function addStaffAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = formData.get("role") as StaffRole;

  if (!email || !fullName || !role) return { error: "All fields are required." };
  if (!(STAFF_ROLES as readonly string[]).includes(role)) {
    return { error: "Please choose a valid role." };
  }

  const admin = createSupabaseAdminClient(); // service role: create the auth user
  // The role change must run as the logged-in admin — a DB guard
  // (guard_profile_role) rejects role edits unless is_admin() is true, which
  // the service-role client can't satisfy. The caller here is already an admin.
  const supabase = await createSupabaseServerClient();

  // Promote if the account already exists.
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ role, full_name: fullName, is_active: true })
      .eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/admin/staff");
    return { success: `${email} is now ${role}. They keep their existing password.` };
  }

  // Otherwise create a ready-to-use, email-confirmed account.
  const tempPassword = generateTempPassword();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createErr) return { error: createErr.message };

  // handle_new_user seeds role=customer; set the real role + activate.
  const { error: roleErr } = await supabase
    .from("profiles")
    .update({ role, full_name: fullName, is_active: true })
    .eq("id", created.user.id);
  if (roleErr) {
    // Roll back the orphaned auth user so the form can be safely resubmitted.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: roleErr.message };
  }

  revalidatePath("/admin/staff");
  return {
    success: `${fullName} added as ${role}. Share these sign-in details:`,
    createdEmail: email,
    tempPassword,
  };
}

export async function updateStaffRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as StaffRole;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  return { success: "Role updated." };
}

export async function deactivateStaffAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  return { success: "Staff member deactivated." };
}
