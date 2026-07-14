"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Conv = {
  id: string;
  customer_user_id: string;
  status: string;
  last_message_at: string;
  businesses: { business_name: string } | null;
  name: string;
};
type Row = { id: string; sender_role: string; body: string; created_at: string };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function SupportInbox() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [staffId, setStaffId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Row[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, customer_user_id, status, last_message_at, businesses(business_name)")
      .order("last_message_at", { ascending: false });
    const rows = (data ?? []) as unknown as Conv[];
    // Resolve customer names (customer_user_id references auth.users, not profiles).
    const ids = [...new Set(rows.map((r) => r.customer_user_id))];
    const nameMap: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      (profs ?? []).forEach((p: { id: string; full_name: string | null; email: string | null }) => {
        nameMap[p.id] = p.full_name || p.email || "Customer";
      });
    }
    setConvs(rows.map((r) => ({ ...r, name: r.businesses?.business_name || nameMap[r.customer_user_id] || "Customer" })));
  }, [supabase]);

  // init: staff id + conversations + list realtime
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setStaffId(user?.id ?? null);
      await loadConvs();
    })();
    // Subscribe synchronously with a unique topic so re-mounts never reuse an
    // already-subscribed channel (which would throw on .on() after subscribe).
    const channel = supabase
      .channel(`support:conversations:${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => loadConvs())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadConvs]);

  // messages for the active conversation + realtime
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, sender_role, body, created_at")
        .eq("conversation_id", activeId)
        .order("created_at");
      setMessages((data ?? []) as Row[]);
    })();
    const channel = supabase
      .channel(`support:${activeId}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const row = payload.new as Row;
          setMessages((m) => (m.some((x) => x.id === row.id) ? m : [...m, row]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function reply() {
    const body = input.trim();
    if (!body || !activeId || !staffId || sending) return;
    setSending(true);
    setInput("");
    const { data } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: activeId, sender_role: "staff", sender_user_id: staffId, body })
      .select("id, sender_role, body, created_at")
      .single();
    if (data) setMessages((m) => (m.some((x) => x.id === data.id) ? m : [...m, data as Row]));
    setSending(false);
  }

  const active = convs.find((c) => c.id === activeId);

  return (
    <div className="grid h-[calc(100dvh-12rem)] min-h-[28rem] grid-cols-1 overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <aside className={cn("flex-col border-r border-line", activeId ? "hidden md:flex" : "flex")}>
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-semibold text-brown-900">Conversations</h2>
          <p className="text-xs text-muted">{convs.length} total</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 && (
            <p className="p-6 text-center text-sm text-muted">No conversations yet.</p>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-line px-4 py-3 text-left hover:bg-brown-50",
                activeId === c.id && "bg-brown-50",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-brown-900">{c.name}</span>
                <span className="text-xs capitalize text-muted">{c.status}</span>
              </span>
              <span className="flex-shrink-0 text-xs text-muted">{timeAgo(c.last_message_at)}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Thread */}
      <section className={cn("flex-col", activeId ? "flex" : "hidden md:flex")}>
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted">
            <MessageSquare className="h-8 w-8 text-brown-400" />
            <p className="text-sm">Select a conversation to reply.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <button className="md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                <ArrowLeft className="h-5 w-5 text-brown-600" />
              </button>
              <div>
                <p className="text-sm font-semibold text-brown-900">{active.name}</p>
                <p className="text-xs capitalize text-muted">{active.status}</p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    m.sender_role === "staff"
                      ? "ml-auto bg-[#6f4a2e] text-cream"
                      : "bg-brown-50 text-brown-900",
                  )}
                >
                  {m.body}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">No messages yet.</p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                reply();
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a reply…"
                className="min-w-0 flex-1 rounded-full border border-line bg-brown-50/40 px-4 py-2 text-sm outline-none focus:border-brown-300 focus:ring-2 focus:ring-brown-100"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send reply"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#6f4a2e] text-cream hover:bg-[#573a26] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
