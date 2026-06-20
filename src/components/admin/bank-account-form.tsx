"use client";

import { useActionState } from "react";
import { upsertBankAccountAction } from "@/lib/actions/admin/settings";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { BankAccount } from "@/lib/types";

export function BankAccountForm({ bank }: { bank?: BankAccount }) {
  const [state, action, pending] = useActionState(
    upsertBankAccountAction,
    initialActionState,
  );

  return (
    <form action={action} className="rounded-xl border border-line bg-cream/40 p-4 space-y-4">
      {bank && <input type="hidden" name="id" value={bank.id} />}
      <input type="hidden" name="isActive" value="true" />

      {state.success && <Alert variant="success">{state.success}</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Account name" htmlFor={`accountName-${bank?.id}`} required>
          <Input
            id={`accountName-${bank?.id}`}
            name="accountName"
            defaultValue={bank?.account_name ?? ""}
            placeholder="Abeyrathna Farms"
            required
          />
        </Field>
        <Field label="Bank name" htmlFor={`bankName-${bank?.id}`} required>
          <Input
            id={`bankName-${bank?.id}`}
            name="bankName"
            defaultValue={bank?.bank_name ?? ""}
            placeholder="Commercial Bank"
            required
          />
        </Field>
        <Field label="Branch" htmlFor={`branch-${bank?.id}`}>
          <Input
            id={`branch-${bank?.id}`}
            name="branch"
            defaultValue={bank?.branch ?? ""}
            placeholder="Negombo"
          />
        </Field>
        <Field label="Account number" htmlFor={`accountNumber-${bank?.id}`} required>
          <Input
            id={`accountNumber-${bank?.id}`}
            name="accountNumber"
            defaultValue={bank?.account_number ?? ""}
            placeholder="[TO BE PROVIDED]"
            required
          />
        </Field>
      </div>
      <Field
        label="Instructions"
        htmlFor={`instructions-${bank?.id}`}
        hint='Shown to customers — e.g. "Use your order number as the reference."'
      >
        <Input
          id={`instructions-${bank?.id}`}
          name="instructions"
          defaultValue={bank?.instructions ?? ""}
        />
      </Field>
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Saving…" : bank ? "Update bank account" : "Add bank account"}
      </Button>
    </form>
  );
}
