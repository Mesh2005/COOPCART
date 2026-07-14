"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CornerDownLeft,
  LayoutDashboard,
  MessagesSquare,
  Search,
  Settings,
  ShoppingBasket,
  Truck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Cmd = { label: string; href: string; icon: LucideIcon; keywords?: string };

const COMMANDS: Cmd[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, keywords: "home dashboard kpi" },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList, keywords: "kanban board fulfilment" },
  { label: "Payments", href: "/admin/payments", icon: Wallet, keywords: "verify slip bank transfer cod" },
  { label: "Products", href: "/admin/products", icon: ShoppingBasket, keywords: "catalogue price tiers grades" },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes, keywords: "stock production trays" },
  { label: "Customers", href: "/admin/customers", icon: Users, keywords: "businesses approve reject" },
  { label: "Live support", href: "/admin/chat", icon: MessagesSquare, keywords: "chat messages" },
  { label: "Delivery zones", href: "/admin/delivery", icon: Truck, keywords: "zones fees blackout" },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, keywords: "analytics revenue charts" },
  { label: "Staff & roles", href: "/admin/staff", icon: UserCog, keywords: "team roles admin manager" },
  { label: "Add staff member", href: "/admin/staff", icon: UserPlus, keywords: "invite new admin create" },
  { label: "Settings", href: "/admin/settings", icon: Settings, keywords: "bank account rules toggles" },
];

/** Open the palette from anywhere (e.g. a header button). */
export function openCommandPalette() {
  window.dispatchEvent(new Event("coopcart:command"));
}

export function CommandTrigger() {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:bg-brown-50 hover:text-brown-700"
      aria-label="Open command palette"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search…</span>
      <kbd className="hidden rounded border border-line bg-brown-50 px-1.5 py-0.5 font-sans text-[10px] font-medium sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("coopcart:command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("coopcart:command", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(term));
  }, [q]);

  useEffect(() => setActive(0), [q]);

  function go(cmd?: Cmd) {
    const c = cmd ?? results[active];
    if (!c) return;
    setOpen(false);
    router.push(c.href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#2a1d14]/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="h-4 w-4 flex-shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search pages and actions…"
            className="h-12 flex-1 bg-transparent text-sm text-brown-900 outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">No matches</li>
          )}
          {results.map((c, i) => (
            <li key={`${c.href}-${c.label}`}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  i === active ? "bg-brown-50 text-brown-900" : "text-brown-700 hover:bg-brown-50/60",
                )}
              >
                <c.icon className="h-4 w-4 flex-shrink-0 text-brown-400" />
                <span className="flex-1">{c.label}</span>
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-muted" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
