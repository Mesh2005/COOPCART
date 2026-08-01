import {
  getSessionUser,
  getCurrentProfile,
  requireProfile,
  requireStaff,
  requireRole,
  getMyBusiness,
} from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// redirect() halts execution in Next by throwing; we mimic that so we can
// assert the destination. Supabase is stubbed so no real session is needed.
jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
jest.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

const mockedServer = createSupabaseServerClient as jest.Mock;

// A fake server client returning a given user and a given row for table reads.
function fakeServer(opts: { user?: unknown; row?: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.maybeSingle = jest.fn().mockResolvedValue({ data: opts.row ?? null });
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: opts.user ?? null } }) },
    from: jest.fn(() => chain),
  };
}

describe("getSessionUser", () => {
  it("returns the authenticated user", async () => {
    mockedServer.mockResolvedValue(fakeServer({ user: { id: "u9" } }));
    expect(await getSessionUser()).toEqual({ id: "u9" });
  });
});

describe("getCurrentProfile", () => {
  it("returns null when nobody is signed in", async () => {
    mockedServer.mockResolvedValue(fakeServer({ user: null }));
    expect(await getCurrentProfile()).toBeNull();
  });

  it("returns the profile row for the signed-in user", async () => {
    const profile = { id: "u1", role: "manager" };
    mockedServer.mockResolvedValue(fakeServer({ user: { id: "u1" }, row: profile }));
    expect(await getCurrentProfile()).toEqual(profile);
  });
});

describe("requireProfile", () => {
  it("redirects anonymous visitors to /login", async () => {
    mockedServer.mockResolvedValue(fakeServer({ user: null }));
    await expect(requireProfile()).rejects.toThrow("REDIRECT:/login");
  });
});

describe("requireStaff", () => {
  it("redirects anonymous visitors to the admin login", async () => {
    mockedServer.mockResolvedValue(fakeServer({ user: null }));
    await expect(requireStaff()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("bounces customers to the customer app", async () => {
    mockedServer.mockResolvedValue(
      fakeServer({ user: { id: "c" }, row: { id: "c", role: "customer" } }),
    );
    await expect(requireStaff()).rejects.toThrow("REDIRECT:/app");
  });

  it("lets a staff member through", async () => {
    const profile = { id: "s", role: "sales" };
    mockedServer.mockResolvedValue(fakeServer({ user: { id: "s" }, row: profile }));
    expect(await requireStaff()).toEqual(profile);
  });
});

describe("requireRole", () => {
  it("allows a user whose role is in the allow-list", async () => {
    const profile = { id: "a", role: "admin" };
    mockedServer.mockResolvedValue(fakeServer({ user: { id: "a" }, row: profile }));
    expect(await requireRole(["admin", "manager"])).toEqual(profile);
  });

  it("redirects a staff member who lacks the required role to /admin", async () => {
    mockedServer.mockResolvedValue(
      fakeServer({ user: { id: "s" }, row: { id: "s", role: "sales" } }),
    );
    await expect(requireRole(["admin", "manager"])).rejects.toThrow("REDIRECT:/admin");
  });
});

describe("getMyBusiness", () => {
  it("returns null when signed out", async () => {
    mockedServer.mockResolvedValue(fakeServer({ user: null }));
    expect(await getMyBusiness()).toBeNull();
  });
});
