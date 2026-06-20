"use client";

import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";
import { BUSINESS_TYPES } from "@/lib/types";
import { BUSINESS_TYPE_LABELS } from "@/lib/labels";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Your details</p>
      <Field label="Full name" htmlFor="fullName" required error={fe.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" required error={fe.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={fe.phone}>
          <Input id="phone" name="phone" inputMode="tel" autoComplete="tel" required />
        </Field>
      </div>
      <Field label="Password" htmlFor="password" required error={fe.password} hint="At least 8 characters">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Business</p>
      <Field label="Business name" htmlFor="businessName" required error={fe.businessName}>
        <Input id="businessName" name="businessName" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type" htmlFor="businessType" required>
          <Select id="businessType" name="businessType" defaultValue="shop">
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {BUSINESS_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="BR number" htmlFor="brNumber" hint="Optional">
          <Input id="brNumber" name="brNumber" />
        </Field>
      </div>
      <Field label="Address" htmlFor="addressLine1" required error={fe.addressLine1}>
        <Input id="addressLine1" name="addressLine1" autoComplete="address-line1" required />
      </Field>
      <Field label="City" htmlFor="city" required error={fe.city}>
        <Input id="city" name="city" autoComplete="address-level2" required />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
