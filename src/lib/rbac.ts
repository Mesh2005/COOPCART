import type { UserRole } from "@/lib/types";

/**
 * Role-based access control for the admin console.
 *
 * The whole console requires a staff role (enforced in the admin layout via
 * requireStaff + RLS). This module adds finer, per-page restrictions on top.
 */

/** Roles allowed to manage the team (Staff & roles page + its actions). */
export const STAFF_MANAGE_ROLES = ["admin", "manager"] as const satisfies readonly UserRole[];

/**
 * Minimum roles for specific admin paths. Any path not listed here is open to
 * all staff roles. A path matches if it equals the key or is nested under it.
 */
export const ADMIN_PATH_ROLES: Record<string, readonly UserRole[]> = {
  "/admin/staff": STAFF_MANAGE_ROLES,
};

/** The roles required for an admin path, or null if it's open to all staff. */
export function rolesForAdminPath(path: string): readonly UserRole[] | null {
  const key = Object.keys(ADMIN_PATH_ROLES).find(
    (p) => path === p || path.startsWith(`${p}/`),
  );
  return key ? ADMIN_PATH_ROLES[key] : null;
}

/** Whether a role may access an admin path. */
export function canAccessAdminPath(role: UserRole, path: string): boolean {
  const roles = rolesForAdminPath(path);
  return !roles || roles.includes(role);
}
