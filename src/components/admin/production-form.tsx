"use client";

import { useActionState } from "react";
import { addProductionAction } from "@/lib/actions/admin/inventory";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
}

export function ProductionForm({ products }: { products: Product[] }) {
  const [state, action, pending] = useActionState(
    addProductionAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-4">
      {state.success && <Alert variant="success">{state.success}</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}

      <Field label="Product" htmlFor="productId" required>
        <Select id="productId" name="productId" required>
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Trays produced" htmlFor="trays" required>
        <Input
          id="trays"
          name="trays"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 50"
          required
        />
      </Field>

      <Field label="Note" htmlFor="note" hint="Optional — batch reference, shift, etc.">
        <Input id="note" name="note" placeholder="Morning batch" />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Record production"}
      </Button>
    </form>
  );
}
