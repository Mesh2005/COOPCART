/** Pure date helpers for delivery/pickup scheduling (no Supabase imports). */

const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Compute selectable delivery dates from the zone's delivery days, honouring an
 * order cut-off (order before cut-off the day before for next-day delivery) and
 * blackout dates. Times are evaluated in the runtime's local zone (Asia/Colombo
 * for Sri Lankan users).
 */
export function computeDeliveryDates(opts: {
  deliveryDays: string[];
  blackoutDates?: string[];
  cutoffTime?: string;
  now?: Date;
  count?: number;
}): string[] {
  const { deliveryDays, blackoutDates = [], cutoffTime = "18:00", now = new Date(), count = 14 } = opts;
  const allowed = new Set(deliveryDays.map((d) => d.toLowerCase()));
  const blackout = new Set(blackoutDates);

  const [ch, cm] = cutoffTime.split(":").map((n) => parseInt(n, 10));
  const pastCutoff =
    now.getHours() > ch || (now.getHours() === ch && now.getMinutes() >= (cm || 0));

  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + (pastCutoff ? 2 : 1));

  const results: string[] = [];
  for (let i = 0; i < 90 && results.length < count; i++) {
    const code = DAY_CODES[cursor.getDay()];
    const iso = toISODate(cursor);
    if (allowed.has(code) && !blackout.has(iso)) results.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

/** Next N calendar days from tomorrow (used for pickup scheduling). */
export function computePickupDates(opts: { blackoutDates?: string[]; now?: Date; count?: number }): string[] {
  const { blackoutDates = [], now = new Date(), count = 14 } = opts;
  const blackout = new Set(blackoutDates);
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  const results: string[] = [];
  for (let i = 0; i < 90 && results.length < count; i++) {
    const iso = toISODate(cursor);
    if (!blackout.has(iso)) results.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

/** Friendly label like "Mon, 23 Jun". */
export function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d);
}
