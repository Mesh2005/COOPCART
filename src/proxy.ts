import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: "Middleware" is now "Proxy" (same functionality).
export async function proxy(request: NextRequest) {
  // Allow the public site to run before Supabase is configured.
  if (!hasSupabaseEnv) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
