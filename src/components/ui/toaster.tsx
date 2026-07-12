"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
type ToastAction = { label: string; href: string };
type Toast = { id: number; message: string; type: ToastType; action?: ToastAction };

/** Fire a toast from any client component, with an optional action link. */
export function toast(message: string, type: ToastType = "info", action?: ToastAction) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("coopcart:toast", { detail: { message, type, action } }));
}

const DURATION = 5000;

const STYLE: Record<ToastType, { border: string; bar: string; icon: React.ReactNode }> = {
  success: {
    border: "border-l-green-500",
    bar: "bg-green-500",
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  },
  error: {
    border: "border-l-red-500",
    bar: "bg-red-500",
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
  },
  info: {
    border: "border-l-[#d9833f]",
    bar: "bg-[#d9833f]",
    icon: <Info className="h-5 w-5 text-[#d9833f]" />,
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let seq = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        message: string;
        type: ToastType;
        action?: ToastAction;
      };
      const t = { id: ++seq, message: detail.message, type: detail.type ?? "info", action: detail.action };
      setToasts((ts) => [...ts, t]);
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), DURATION);
    };
    window.addEventListener("coopcart:toast", handler);
    return () => window.removeEventListener("coopcart:toast", handler);
  }, []);

  const dismiss = (id: number) => setToasts((ts) => ts.filter((x) => x.id !== id));

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[70] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "animate-fade-up pointer-events-auto relative overflow-hidden rounded-xl border border-l-4 border-line bg-surface px-4 py-3 shadow-lg",
            STYLE[t.type].border,
          )}
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0">{STYLE[t.type].icon}</span>
            <div className="flex-1">
              <p className="text-sm text-brown-900">{t.message}</p>
              {t.action && (
                <Link
                  href={t.action.href}
                  onClick={() => dismiss(t.id)}
                  className="mt-1 inline-block text-xs font-semibold text-brown-600 hover:text-brown-800"
                >
                  {t.action.label} &rarr;
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="flex-shrink-0 text-muted hover:text-brown-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <span
            className={cn("toast-progress absolute bottom-0 left-0 h-0.5 w-full", STYLE[t.type].bar)}
          />
        </div>
      ))}
    </div>
  );
}
