"use client";

import { useActionState, useState } from "react";
import {
  upsertDeliveryZoneAction,
  addBlackoutDateAction,
  removeBlackoutDateAction,
} from "@/lib/actions/admin/settings";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatLKR } from "@/lib/format";
import type { DeliveryZone } from "@/lib/types";

const DAYS = [
  { code: "mon", label: "Mon" },
  { code: "tue", label: "Tue" },
  { code: "wed", label: "Wed" },
  { code: "thu", label: "Thu" },
  { code: "fri", label: "Fri" },
  { code: "sat", label: "Sat" },
  { code: "sun", label: "Sun" },
];

function ZoneForm({ zone }: { zone?: DeliveryZone }) {
  const [state, action, pending] = useActionState(
    upsertDeliveryZoneAction,
    initialActionState,
  );
  const [open, setOpen] = useState(!zone);

  if (!open && zone) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-line bg-brown-50/40 px-4 py-3">
        <div>
          <span className="font-medium text-brown-900">{zone.name}</span>
          <span className="ml-2 text-sm text-muted">
            Base: {formatLKR(zone.base_fee)} · Per tray: {formatLKR(zone.per_tray_fee)}
          </span>
          <span className="ml-2 text-xs text-muted">
            [{zone.delivery_days.join(", ")}]
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-line bg-brown-50/40 p-4 space-y-3">
      {zone && <input type="hidden" name="id" value={zone.id} />}
      {state.success && <Alert variant="success">{state.success}</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Zone name" htmlFor={`zoneName-${zone?.id}`} required>
          <Input
            id={`zoneName-${zone?.id}`}
            name="name"
            defaultValue={zone?.name ?? ""}
            required
          />
        </Field>
        <Field label="Base fee (LKR)" htmlFor={`baseFee-${zone?.id}`} required>
          <Input
            id={`baseFee-${zone?.id}`}
            name="baseFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={zone?.base_fee ?? ""}
            required
          />
        </Field>
        <Field label="Per-tray fee (LKR)" htmlFor={`perTrayFee-${zone?.id}`} required>
          <Input
            id={`perTrayFee-${zone?.id}`}
            name="perTrayFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={zone?.per_tray_fee ?? ""}
            required
          />
        </Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-brown-900">Delivery days</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <label key={d.code} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                name="deliveryDays"
                value={d.code}
                defaultChecked={zone?.delivery_days.includes(d.code)}
                className="accent-brown-600"
              />
              <span className="text-sm text-brown-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : zone ? "Update zone" : "Add zone"}
        </Button>
        {zone && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function DeliveryZoneManager({
  zones,
  blackouts,
}: {
  zones: DeliveryZone[];
  blackouts: { id: string; date: string; reason: string | null }[];
}) {
  const [addState, addAction, addPending] = useActionState(
    addBlackoutDateAction,
    initialActionState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeBlackoutDateAction,
    initialActionState,
  );
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brown-900">
          Delivery zones
        </h3>
        <div className="space-y-2">
          {zones.map((z) => (
            <ZoneForm key={z.id} zone={z} />
          ))}
          {showNew ? (
            <ZoneForm />
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNew(true)}
            >
              + Add zone
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-3 text-sm font-semibold text-brown-900">
          Blackout dates
        </h3>
        {addState.success && (
          <Alert variant="success" className="mb-3">{addState.success}</Alert>
        )}
        {addState.error && (
          <Alert variant="error" className="mb-3">{addState.error}</Alert>
        )}
        <ul className="mb-4 space-y-2">
          {blackouts.length === 0 && (
            <li className="text-sm text-muted">No upcoming blackout dates.</li>
          )}
          {blackouts.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-line bg-brown-50/40 px-3 py-2 text-sm"
            >
              <span className="font-medium text-brown-900">{b.date}</span>
              {b.reason && <span className="text-muted">{b.reason}</span>}
              <form action={removeAction}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  disabled={removePending}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form action={addAction} className="flex items-end gap-2">
          <Field label="Date" htmlFor="blackoutDate" required>
            <Input
              id="blackoutDate"
              name="date"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </Field>
          <Field label="Reason (optional)" htmlFor="blackoutReason">
            <Input id="blackoutReason" name="reason" placeholder="Public holiday" />
          </Field>
          <Button type="submit" size="sm" disabled={addPending} className="mb-0.5">
            {addPending ? "…" : "Add"}
          </Button>
        </form>
      </div>
    </div>
  );
}
