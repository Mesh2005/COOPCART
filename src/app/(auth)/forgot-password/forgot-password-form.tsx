"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { requestPasswordResetOtp, resetPasswordAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [reqState, requestAction, requesting] = useActionState(
    requestPasswordResetOtp,
    initialActionState,
  );
  const [resState, resetAction, resetting] = useActionState(
    resetPasswordAction,
    initialActionState,
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (reqState.otpSent) setStep(2);
  }, [reqState.otpSent]);

  if (step === 2) {
    return (
      <div className="space-y-4">
        {reqState.success && <Alert variant="success">{reqState.success}</Alert>}
        {resState.error && <Alert variant="error">{resState.error}</Alert>}

        <form action={resetAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
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
          <Field label="New password" htmlFor="password" required hint="At least 8 characters">
            <Input id="password" name="password" type="password" autoComplete="new-password" required />
          </Field>
          <Button type="submit" disabled={resetting} className="w-full">
            {resetting ? "Resetting…" : "Reset password"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-muted hover:text-brown-800"
          >
            <ArrowLeft className="h-4 w-4" /> Change email
          </button>
          <form action={requestAction}>
            <input type="hidden" name="email" value={email} />
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

  return (
    <form action={requestAction} className="space-y-4">
      {reqState.error && <Alert variant="error">{reqState.error}</Alert>}
      <Field label="Email" htmlFor="email" required error={reqState.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.lk"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Button type="submit" disabled={requesting} className="w-full">
        {requesting ? "Sending code…" : "Send reset code"}
      </Button>
    </form>
  );
}
