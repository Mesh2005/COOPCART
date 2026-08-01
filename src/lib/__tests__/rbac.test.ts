import {
  rolesForAdminPath,
  canAccessAdminPath,
  STAFF_MANAGE_ROLES,
} from "@/lib/rbac";

describe("rolesForAdminPath", () => {
  it("restricts the staff page to the staff-manage roles", () => {
    expect(rolesForAdminPath("/admin/staff")).toBe(STAFF_MANAGE_ROLES);
  });

  it("applies the same restriction to nested staff paths", () => {
    expect(rolesForAdminPath("/admin/staff/new")).toBe(STAFF_MANAGE_ROLES);
  });

  it("returns null (open to all staff) for unlisted paths", () => {
    expect(rolesForAdminPath("/admin/orders")).toBeNull();
  });

  it("does not treat a similarly-named path as nested", () => {
    // "/admin/staffing" is not under "/admin/staff"
    expect(rolesForAdminPath("/admin/staffing")).toBeNull();
  });
});

describe("canAccessAdminPath", () => {
  it("allows admin and manager on the staff page", () => {
    expect(canAccessAdminPath("admin", "/admin/staff")).toBe(true);
    expect(canAccessAdminPath("manager", "/admin/staff")).toBe(true);
  });

  it("blocks other staff roles from the staff page", () => {
    expect(canAccessAdminPath("sales", "/admin/staff")).toBe(false);
    expect(canAccessAdminPath("delivery", "/admin/staff")).toBe(false);
  });

  it("allows any role on an unrestricted path", () => {
    expect(canAccessAdminPath("sales", "/admin/orders")).toBe(true);
  });
});
