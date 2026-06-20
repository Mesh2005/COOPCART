import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on each request and performs an
 * optimistic redirect for protected areas. Real authorization is enforced by
 * RLS and per-page/server-action checks (see Next 16 "Proxy" guidance).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAppArea = path.startsWith("/app");
  const isAdminArea = path.startsWith("/admin") && path !== "/admin/login";

  // Unauthenticated → send to the matching login, preserving the target.
  if (!user) {
    if (isAppArea || isAdminArea) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = isAdminArea ? "/admin/login" : "/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Authenticated users may still open a login page to SWITCH accounts
  // (each login page shows a "signed in as …" banner). Only bounce them off
  // /register, since they already have an account.
  if (path === "/register") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
