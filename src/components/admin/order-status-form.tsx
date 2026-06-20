"use client";

import { useActionState } from "react";
import {
  setOrderStatusAction,
  updateInternalNoteAction,
} from "@/lib/actions/admin/orders";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUS_LABELS } from "@/lib/labels";
import type { AdminOrderDetail } from "@/lib/data/admin/orders";
import type { OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "packed",
  packed: "out_for_delivery",
  out_for_delivery: "delivered",
  ready_for_pickup: "delivered",
};

export function OrderStatusForm({ order }: { order: AdminOrderDetail }) {
  const [statusState, statusAction, statusPending] = useActionState(
    setOrderStatusAction,
    initialActionState,
  );
  const [noteState, noteAction, notePending] = useActionState(
    updateInternalNoteAction,
    initialActionState,
  );

  const next = NEXT_STATUS[order.status];
  const isFulfillmentDelivery = order.fulfillment_type === "delivery";
  const actualNext =
    order.status === "packed"
      ? isFulfillmentDelivery
        ? "out_for_delivery"
        : "ready_for_pickup"
      : next;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <h2 className="font-display text-base font-semibold text-brown-900">
        Status
      </h2>

      {statusState.success && (
        <Alert variant="success">{statusState.success}</Alert>
      )}
      {statusState.error && (
        <Alert variant="error">{statusState.error}</Alert>
      )}

      {actualNext && (
        <form action={statusAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="newStatus" value={actualNext} />
          <Field label="Note (optional)" htmlFor="note">
            <Textarea id="note" name="note" rows={2} />
          </Field>
          <Button type="submit" disabled={statusPending} className="mt-3 w-full">
            {statusPending
              ? "Updating…"
              : `Move to ${ORDER_STATUS_LABELS[actualNext]}`}
          </Button>
        </form>
      )}

      {order.status !== "cancelled" && (
        <form action={statusAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="newStatus" value="cancelled" />
          <Field label="Cancel reason" htmlFor="cancelNote" required>
            <Textarea id="cancelNote" name="note" rows={2} required />
          </Field>
          <Button
            type="submit"
            variant="destructive"
            disabled={statusPending}
            className="mt-2 w-full"
          >
            Cancel order
          </Button>
        </form>
      )}

      <div className="border-t border-line pt-4">
        <h3 className="mb-2 text-sm font-semibold text-brown-900">
          Internal note
        </h3>
        {noteState.success && (
          <Alert variant="success" className="mb-2">
            {noteState.success}
          </Alert>
        )}
        <form action={noteAction} className="space-y-2">
          <input type="hidden" name="orderId" value={order.id} />
          <Textarea
            name="note"
            rows={2}
            defaultValue={order.internal_note ?? ""}
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={notePending}
          >
            {notePending ? "Saving…" : "Save note"}
          </Button>
        </form>
      </div>
    </div>
  );
}
