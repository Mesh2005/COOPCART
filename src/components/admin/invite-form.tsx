"use client";

import { useActionState } from "react";
import { addStaffAction } from "@/lib/actions/admin/staff";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { STAFF_ROLES } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  sales: "Sales",
  inventory: "Inventory",
  delivery: "Delivery",
};

export function InviteFormClient({ canCreateAdmin = false }: { canCreateAdmin?: boolean }) {
  const [state, action, pending] = useActionState(addStaffAction, initialActionState);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {state.success && (
        <Alert variant="success" className="sm:col-span-2">
          <p>{state.success}</p>
          {state.createdEmail && state.tempPassword && (
            <div className="mt-2 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-brown-900">
              <div>Email: {state.createdEmail}</div>
              <div>Temp password: {state.tempPassword}</div>
              <p className="mt-1 font-sans text-xs text-muted">
                Share these with the staff member. They sign in at /admin and can change the
                password later via “Forgot password”.
              </p>
            </div>
          )}
        </Alert>
      )}
      {state.error && (
        <Alert variant="error" className="sm:col-span-2">
          {state.error}
        </Alert>
      )}
      <Field label="Full name" htmlFor="fullName" required>
        <Input id="fullName" name="fullName" required />
      </Field>
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Role" htmlFor="role" required>
        <Select id="role" name="role" required defaultValue="manager">
          {STAFF_ROLES.filter((r) => canCreateAdmin || r !== "admin").map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Adding…" : "Add staff member"}
        </Button>
      </div>
    </form>
  );
}
