/** Currency + locale formatting helpers (CoopCart is LKR-only). */

const lkr = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 });

/** Format a rupee amount, e.g. `Rs. 1,500` (or `LKR 1,500` with `code`). */
export function formatLKR(amount: number, opts?: { code?: boolean }): string {
  const value = lkr.format(Number.isFinite(amount) ? amount : 0);
  return opts?.code ? `LKR ${value}` : `Rs. ${value}`;
}

/** Short date, e.g. `19 Jun 2026`. */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
