"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brown-700 transition-colors hover:bg-brown-50",
          className,
        )}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </form>
  );
}
