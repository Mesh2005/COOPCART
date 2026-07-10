"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Egg, Bot, Headset } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LiveChatPanel } from "./live-chat-panel";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the CoopCart assistant 🥚 Ask me about grades, pricing, minimum order, payment, delivery, or how to register — or switch to Live chat to reach our team.",
};

const SUGGESTIONS = [
  "What's the minimum order?",
  "What payment methods do you accept?",
  "Which days do you deliver?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"assistant" | "live">("assistant");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track whether the live chat is being viewed, for the realtime callback.
  const viewingLive = useRef(false);
  viewingLive.current = open && tab === "live";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Unread badge: count staff replies that arrive while the live chat isn't open.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: ReturnType<typeof supabase.channel> | undefined;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel(`chat-unread:${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages" },
          (payload) => {
            if ((payload.new as { sender_role?: string }).sender_role === "staff" && !viewingLive.current) {
              setUnread((u) => u + 1);
            }
          },
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Clear the badge when the user opens the live chat.
  useEffect(() => {
    if (open && tab === "live") setUnread(0);
  }, [open, tab]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user", content } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brown-600 text-cream shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-cream">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-scale-in fixed bottom-24 right-5 z-[60] flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line bg-brown-600 px-4 py-3 text-cream">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15">
              <Egg className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">CoopCart Support</p>
              <p className="text-[11px] text-cream/70">
                {tab === "assistant" ? "AI assistant · instant answers" : "Live chat with our team"}
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-line bg-cream/40 p-1.5">
            <TabButton active={tab === "assistant"} onClick={() => setTab("assistant")} icon={Bot} label="Assistant" />
            <TabButton active={tab === "live"} onClick={() => setTab("live")} icon={Headset} label="Live chat" />
          </div>

          {tab === "assistant" ? (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "user" ? "ml-auto bg-brown-600 text-cream" : "bg-brown-50 text-brown-900",
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="flex max-w-[85%] gap-1 rounded-2xl bg-brown-50 px-3.5 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brown-300 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brown-300 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brown-300" />
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="space-y-1.5 pt-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="block w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-left text-xs font-medium text-brown-700 hover:bg-brown-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 border-t border-line p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question…"
                  className="min-w-0 flex-1 rounded-full border border-line bg-cream/40 px-4 py-2 text-sm outline-none focus:border-brown-300 focus:ring-2 focus:ring-brown-100"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brown-600 text-cream transition-opacity hover:bg-brown-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <LiveChatPanel />
          )}
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bot;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "bg-surface text-brown-800 shadow-sm" : "text-muted hover:text-brown-700",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
