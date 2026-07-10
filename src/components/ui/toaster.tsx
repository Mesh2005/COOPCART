"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

/** Fire a toast from any client component. */
export function toast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("coopcart:toast", { detail: { message, type } }));
}

const STYLE: Record<ToastType, { border: string; icon: React.ReactNode }> = {
  success: { border: "border-l-green-500", icon: <CheckCircle2 className="h-5 w-5 text-green-600" /> },
  error: { border: "border-l-red-500", icon: <AlertCircle className="h-5 w-5 text-red-600" /> },
  info: { border: "border-l-[#d9833f]", icon: <Info className="h-5 w-5 text-[#d9833f]" /> },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let seq = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; type: ToastType };
      const t = { id: ++seq, message: detail.message, type: detail.type ?? "info" };
      setToasts((ts) => [...ts, t]);
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 4500);
    };
    window.addEventListener("coopcart:toast", handler);
    return () => window.removeEventListener("coopcart:toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[70] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-fade-up pointer-events-auto flex items-start gap-2.5 rounded-xl border border-l-4 border-line bg-surface px-4 py-3 shadow-lg",
            STYLE[t.type].border,
          )}
        >
          <span className="mt-0.5 flex-shrink-0">{STYLE[t.type].icon}</span>
          <p className="flex-1 text-sm text-brown-900">{t.message}</p>
          <button
            onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
            aria-label="Dismiss"
            className="flex-shrink-0 text-muted hover:text-brown-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
