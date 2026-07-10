"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  type: string;
  title: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function ago(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationBell({ dark }: { dark?: boolean }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotes((data ?? []) as Note[]);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      await load();
    })();
    const channel = supabase
      .channel(`notif:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const title = (payload.new as { title?: string }).title;
            if (title) toast(title, "info");
          }
          load();
        },
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = notes.filter((n) => !n.is_read).length;

  async function markAllRead() {
    setNotes((ns) => ns.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  }
  async function markRead(id: string) {
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          dark ? "text-brown-100 hover:bg-white/10" : "text-brown-700 hover:bg-brown-50",
        )}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-semibold text-brown-900">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-brown-600 hover:text-brown-800"
              >
                <Check className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              notes.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "flex items-start gap-3 border-b border-line px-4 py-3 text-sm last:border-0",
                      !n.is_read && "bg-yolk-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                        n.is_read ? "bg-transparent" : "bg-[#d9833f]",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-brown-900">{n.title}</p>
                      <p className="text-xs text-muted">{ago(n.created_at)} ago</p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    className="block hover:bg-brown-50/50"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="block w-full text-left hover:bg-brown-50/50"
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
