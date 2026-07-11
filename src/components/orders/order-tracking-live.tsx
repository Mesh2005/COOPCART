"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Subscribes to this order's status trail and re-fetches the server component
 * whenever the order advances, so the tracker updates without a manual refresh.
 * Renders a small live indicator.
 */
export function OrderTrackingLive({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [live, setLive] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`track:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events", filter: `order_id=eq.${orderId}` },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => router.refresh(),
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, orderId, router]);

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
      title={live ? "Live updates on" : "Connecting…"}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          live ? "animate-pulse bg-sage-500" : "bg-brown-300",
        )}
      />
      {live ? "Live" : "…"}
    </span>
  );
}
