"use client";

import { useActionState, useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { requestSignupOtp, registerAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";
import { BUSINESS_TYPES } from "@/lib/types";
import { BUSINESS_TYPE_LABELS } from "@/lib/labels";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  businessName: "",
  businessType: "shop",
  brNumber: "",
  addressLine1: "",
  city: "",
};

export function RegisterForm() {
  const [otpState, requestAction, requesting] = useActionState(
    requestSignupOtp,
    initialActionState,
  );
  const [regState, registerFormAction, registering] = useActionState(
    registerAction,
    initialActionState,
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(EMPTY);
  const fe = otpState.fieldErrors ?? {};

  useEffect(() => {
    if (otpState.otpSent) setStep(2);
  }, [otpState.otpSent]);

  const bind = (k: keyof typeof EMPTY) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  // ---- Step 2: email verification ----------------------------------------
  if (step === 2) {
    return (
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Step 2 of 2 · Verify email
        </p>

        {otpState.success && <Alert variant="success">{otpState.success}</Alert>}
        {regState.error && <Alert variant="error">{regState.error}</Alert>}

        <div className="flex items-start gap-3 rounded-2xl border border-line bg-brown-50/60 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-sage-500" />
          <p className="text-sm text-brown-800">
            We emailed a 6-digit code to{" "}
            <span className="font-semibold text-brown-900">{form.email}</span>. Enter
            it below to finish creating your account.
          </p>
        </div>

        <form action={registerFormAction} className="space-y-4">
          {Object.entries(form).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}

          <Field label="Verification code" htmlFor="code" required>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
              required
            />
          </Field>

          <Button type="submit" loading={registering} className="w-full">
            {registering ? "Verifying…" : "Verify & create account"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-muted hover:text-brown-800"
          >
            <ArrowLeft className="h-4 w-4" /> Edit details
          </button>
          <form action={requestAction}>
            {Object.entries(form).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <button
              type="submit"
              disabled={requesting}
              className="font-medium text-brown-700 hover:text-brown-900 disabled:opacity-50"
            >
              {requesting ? "Sending…" : "Resend code"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- Step 1: business details ------------------------------------------
  return (
    <form action={requestAction} className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Step 1 of 2 · Your details
      </p>
      {otpState.error && <Alert variant="error">{otpState.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={fe.fullName}>
          <Input id="fullName" name="fullName" autoComplete="name" required {...bind("fullName")} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={fe.phone}>
          <Input id="phone" name="phone" inputMode="tel" autoComplete="tel" required {...bind("phone")} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" required error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required {...bind("email")} />
      </Field>
      <Field label="Password" htmlFor="password" required error={fe.password} hint="At least 8 characters">
        <Input id="password" name="password" type="password" autoComplete="new-password" required {...bind("password")} />
      </Field>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Business</p>
      <Field label="Business name" htmlFor="businessName" required error={fe.businessName}>
        <Input id="businessName" name="businessName" required {...bind("businessName")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business type" htmlFor="businessType" required>
          <Select id="businessType" name="businessType" {...bind("businessType")}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {BUSINESS_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="BR number" htmlFor="brNumber" hint="Optional">
          <Input id="brNumber" name="brNumber" {...bind("brNumber")} />
        </Field>
      </div>
      <Field label="Address" htmlFor="addressLine1" required error={fe.addressLine1}>
        <Input id="addressLine1" name="addressLine1" autoComplete="address-line1" required {...bind("addressLine1")} />
      </Field>
      <Field label="City" htmlFor="city" required error={fe.city}>
        <Input id="city" name="city" autoComplete="address-level2" required {...bind("city")} />
      </Field>

      <Button type="submit" loading={requesting} className="w-full">
        {requesting ? "Sending code…" : "Continue — verify email"}
      </Button>
    </form>
  );
}
