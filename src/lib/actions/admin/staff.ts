"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/state";
import type { StaffRole } from "@/lib/types";

export async function inviteStaffAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as StaffRole;

  if (!email || !fullName || !role) return { error: "All fields are required." };

  const admin = createSupabaseAdminClient();
  const { data, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (invErr) return { error: invErr.message };

  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role, full_name: fullName })
    .eq("id", data.user.id);
  if (roleErr) return { error: roleErr.message };

  revalidatePath("/admin/staff");
  return { success: `Invitation sent to ${email}.` };
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
