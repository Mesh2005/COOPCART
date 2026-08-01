"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Headset } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Row = { id: string; sender_role: string; body: string; created_at: string };

export function LiveChatPanel() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Row[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUserId(null);
        return;
      }
      setUserId(user.id);

      let { data: conv } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_user_id", user.id)
        .eq("status", "open")
        .order("last_message_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!conv) {
        const { data: biz } = await supabase
          .from("businesses")
          .select("id")
          .eq("owner_user_id", user.id)
          .maybeSingle();
        const { data: created } = await supabase
          .from("chat_conversations")
          .insert({ customer_user_id: user.id, business_id: biz?.id ?? null })
          .select("id")
          .single();
        conv = created;
      }
      if (!conv || cancelled) return;
      setConvId(conv.id);

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("id, sender_role, body, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at");
      if (cancelled) return;
      setMessages(msgs ?? []);

      channel = supabase
        .channel(`chat:${conv.id}:${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conv.id}` },
          (payload) => {
            const row = payload.new as Row;
            setMessages((m) => (m.some((x) => x.id === row.id) ? m : [...m, row]));
          },
        )
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const body = input.trim();
    if (!body || !convId || !userId || sending) return;
    setSending(true);
    setInput("");
    const { data } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: convId, sender_role: "customer", sender_user_id: userId, body })
      .select("id, sender_role, body, created_at")
      .single();
    if (data) setMessages((m) => (m.some((x) => x.id === data.id) ? m : [...m, data as Row]));
    setSending(false);
  }

  if (userId === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="loader" />
      </div>
    );
  }

  if (userId === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <Headset className="h-8 w-8 text-brown-300" />
        <p className="text-sm text-muted">
          Log in to your wholesale account to chat with the Abeyrathna Farms team.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-[#6f4a2e] px-4 py-2 text-sm font-medium text-cream hover:bg-[#573a26]"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl bg-brown-50 px-3.5 py-2 text-sm text-brown-900">
          You&apos;re connected to Abeyrathna Farms. Send a message and our team
          will reply here — we&apos;ll get back to you as soon as we can.
        </div>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
              m.sender_role === "customer"
                ? "ml-auto bg-[#6f4a2e] text-cream"
                : "bg-sage-200 text-[#2a1d14]",
            )}
          >
            {m.body}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the team…"
          className="min-w-0 flex-1 rounded-full border border-line bg-brown-50/40 px-4 py-2 text-sm outline-none focus:border-brown-300 focus:ring-2 focus:ring-brown-100"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#6f4a2e] text-cream hover:bg-[#573a26] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </>
  );
}
