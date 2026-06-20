"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowRight, Banknote, Store, Truck, Wallet, type LucideIcon } from "lucide-react";
import { placeOrder } from "@/lib/actions/orders";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatLKR } from "@/lib/format";
import { computeDeliveryDates, computePickupDates, formatDateLabel } from "@/lib/delivery-dates";
import { cn } from "@/lib/utils";

type Line = { name: string; qty: number; lineTotal: number };
type Zone = { id: string; name: string; base_fee: number; per_tray_fee: number; delivery_days: string[] };
type Bank = {
  account_name: string;
  bank_name: string;
  branch: string | null;
  account_number: string;
  instructions: string | null;
};

export function CheckoutForm({
  lines,
  subtotal,
  totalTrays,
  zones,
  banks,
  blackouts,
  settings,
}: {
  lines: Line[];
  subtotal: number;
  totalTrays: number;
  zones: Zone[];
  banks: Bank[];
  blackouts: string[];
  settings: { cod_enabled: boolean; bank_transfer_enabled: boolean; order_cutoff_time: string };
}) {
  const [state, action, pending] = useActionState(placeOrder, initialActionState);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [date, setDate] = useState("");

  const methods = useMemo<("bank_transfer" | "cod")[]>(() => {
    const m: ("bank_transfer" | "cod")[] = [];
    if (settings.bank_transfer_enabled) m.push("bank_transfer");
    if (settings.cod_enabled) m.push("cod");
    if (m.length === 0) m.push("bank_transfer");
    return m;
  }, [settings]);
  const [method, setMethod] = useState<"bank_transfer" | "cod">(methods[0]);

  const selectedZone = zones.find((z) => z.id === zoneId);

  const dates = useMemo(() => {
    if (fulfillment === "delivery") {
      if (!selectedZone) return [];
      return computeDeliveryDates({
        deliveryDays: selectedZone.delivery_days,
        blackoutDates: blackouts,
        cutoffTime: settings.order_cutoff_time,
      });
    }
    return computePickupDates({ blackoutDates: blackouts });
  }, [fulfillment, selectedZone, blackouts, settings.order_cutoff_time]);

  useEffect(() => {
    if (!dates.includes(date)) setDate(dates[0] ?? "");
  }, [dates, date]);

  const deliveryFee =
    fulfillment === "delivery" && selectedZone
      ? selectedZone.base_fee + selectedZone.per_tray_fee * totalTrays
      : 0;
  const total = subtotal + deliveryFee;
  const bank = banks[0];

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {state.error && <Alert variant="error">{state.error}</Alert>}

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">Fulfilment</h2>
          <input type="hidden" name="fulfillment" value={fulfillment} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <OptionCard active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")} icon={Truck} title="Delivery" desc="To your business address" />
            <OptionCard active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")} icon={Store} title="Pickup" desc="Collect from the farm · free" />
          </div>

          {fulfillment === "delivery" && (
            <div className="mt-4 space-y-4">
              <Field label="Delivery zone" htmlFor="zoneId" required>
                <Select id="zoneId" name="zoneId" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Delivery address" htmlFor="address" required>
                <Textarea id="address" name="address" rows={2} placeholder="Street, area, city" required />
              </Field>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">
            {fulfillment === "delivery" ? "Delivery date" : "Pickup date"}
          </h2>
          {dates.length === 0 ? (
            <Alert variant="info" className="mt-4">
              No dates are currently available for this option. Try another zone or check back later.
            </Alert>
          ) : (
            <Field
              className="mt-4"
              label="Choose a date"
              htmlFor="scheduledDate"
              required
              hint={fulfillment === "delivery" ? "Order before 6:00 PM the day before." : undefined}
            >
              <Select id="scheduledDate" name="scheduledDate" value={date} onChange={(e) => setDate(e.target.value)}>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {formatDateLabel(d)}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold text-brown-900">Payment</h2>
          <input type="hidden" name="paymentMethod" value={method} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.includes("bank_transfer") && (
              <OptionCard active={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")} icon={Banknote} title="Bank transfer" desc="Upload your slip after ordering" />
            )}
            {methods.includes("cod") && (
              <OptionCard active={method === "cod"} onClick={() => setMethod("cod")} icon={Wallet} title="Cash on delivery" desc="Pay when you receive" />
            )}
          </div>
          {method === "bank_transfer" && bank && (
            <div className="mt-4 rounded-xl border border-line bg-cream/50 p-4 text-sm">
              <p className="font-semibold text-brown-900">Bank transfer details</p>
              <dl className="mt-2 space-y-1">
                <Row k="Account name" v={bank.account_name} />
                <Row k="Bank" v={bank.bank_name} />
                {bank.branch && <Row k="Branch" v={bank.branch} />}
                <Row k="Account number" v={bank.account_number} />
              </dl>
              <p className="mt-2 text-xs text-muted">
                {bank.instructions ?? "Use your order number as the payment reference."} You can upload
                your slip from the order page after placing the order.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <Field label="Order note" htmlFor="note" hint="Optional — anything we should know.">
            <Textarea id="note" name="note" rows={2} />
          </Field>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-semibold text-brown-900">Summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="text-muted">
                {l.name} × {l.qty}
              </span>
              <span className="font-medium text-brown-800">{formatLKR(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal ({totalTrays} trays)</dt>
            <dd className="font-medium text-brown-800">{formatLKR(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery fee</dt>
            <dd className="font-medium text-brown-800">
              {fulfillment === "pickup" ? "Free" : formatLKR(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base">
            <dt className="font-semibold text-brown-900">Total</dt>
            <dd className="font-semibold text-brown-900">{formatLKR(total)}</dd>
          </div>
        </dl>
        <Button type="submit" disabled={pending || dates.length === 0} className="mt-5 w-full">
          {pending ? (
            "Placing order…"
          ) : (
            <>
              Place order <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">Stock is reserved when you place the order.</p>
      </aside>
    </form>
  );
}

function OptionCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
        active ? "border-brown-500 bg-brown-50 ring-1 ring-brown-400" : "border-line bg-surface hover:bg-brown-50",
      )}
    >
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-brown-600 text-cream" : "bg-brown-50 text-brown-500")}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-brown-900">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="font-medium text-brown-800">{v}</dd>
    </div>
  );
}
