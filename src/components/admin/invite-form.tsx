"use client";

import { useActionState } from "react";
import { inviteStaffAction } from "@/lib/actions/admin/staff";
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

export function InviteFormClient() {
  const [state, action, pending] = useActionState(
    inviteStaffAction,
    initialActionState,
  );

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {state.success && (
        <Alert variant="success" className="sm:col-span-2">
          {state.success}
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
        <Select id="role" name="role" required>
          {STAFF_ROLES.filter((r) => r !== "admin").map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending…" : "Send invitation"}
        </Button>
      </div>
    </form>
  );
}
