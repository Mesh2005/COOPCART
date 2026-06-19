"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function LoginForm({ next, status }: { next?: string; status?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialActionState);

  return (
    <form action={action} className="space-y-4">
      {status === "registered" && (
        <Alert variant="success">
          Account created. You can log in once an admin approves your business.
        </Alert>
      )}
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <input type="hidden" name="next" value={next ?? "/app"} />

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@business.lk" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
