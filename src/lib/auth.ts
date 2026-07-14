import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STAFF_ROLES, type Business, type Profile, type UserRole } from "@/lib/types";

/** The authenticated Supabase user (or null). */
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user's profile row (or null). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}

/** Require a logged-in user; redirect to /login otherwise. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** Require a staff role; redirect customers to /app, anon to the admin login. */
export async function requireStaff(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (!(STAFF_ROLES as readonly string[]).includes(profile.role)) redirect("/app");
  return profile;
}

/**
 * Require one of the given roles for a page. Builds on requireStaff, then
 * bounces staff who lack the role back to the admin overview.
 */
export async function requireRole(roles: readonly UserRole[]): Promise<Profile> {
  const profile = await requireStaff();
  if (!roles.includes(profile.role as UserRole)) redirect("/admin");
  return profile;
}

/** The current user's business (or null). */
export async function getMyBusiness(): Promise<Business | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  return (data as Business | null) ?? null;
}
