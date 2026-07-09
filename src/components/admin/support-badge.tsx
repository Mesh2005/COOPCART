"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Live count of open conversations awaiting a staff reply. Shown on the
 * admin "Live support" nav item; updates in real time.
 */
export function SupportBadge() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { count } = await supabase
        .from("chat_conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "open")
        .eq("awaiting_staff", true);
      if (active) setCount(count ?? 0);
    };
    load();
    const channel = supabase
      .channel(`support-badge:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}
