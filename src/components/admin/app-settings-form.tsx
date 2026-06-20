"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/actions/admin/settings";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { AppSettings } from "@/lib/types";

export function AppSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.success && <Alert variant="success">{state.success}</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum order (trays)" htmlFor="minOrderTrays" required>
          <Input
            id="minOrderTrays"
            name="minOrderTrays"
            type="number"
            min="1"
            defaultValue={settings.min_order_trays}
            required
          />
        </Field>
        <Field label="Order cutoff time" htmlFor="cutoffTime" required>
          <Input
            id="cutoffTime"
            name="cutoffTime"
            type="time"
            defaultValue={settings.order_cutoff_time.slice(0, 5)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-line bg-cream p-4 cursor-pointer">
          <input
            type="checkbox"
            name="bankTransferEnabled"
            value="true"
            defaultChecked={settings.bank_transfer_enabled}
            className="h-4 w-4 accent-brown-600"
          />
          <span className="text-sm font-medium text-brown-900">
            Bank transfer enabled
          </span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-line bg-cream p-4 cursor-pointer">
          <input
            type="checkbox"
            name="codEnabled"
            value="true"
            defaultChecked={settings.cod_enabled}
            className="h-4 w-4 accent-brown-600"
          />
          <span className="text-sm font-medium text-brown-900">
            Cash on delivery enabled
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact phone" htmlFor="contactPhone">
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={settings.contact_phone ?? ""}
          />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail">
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings.contact_email ?? ""}
          />
        </Field>
        <Field label="Contact address" htmlFor="contactAddress">
          <Input
            id="contactAddress"
            name="contactAddress"
            defaultValue={settings.contact_address ?? ""}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
