"use client";

import { useActionState, useState } from "react";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { verifyPaymentAction } from "@/lib/actions/admin/payments";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatLKR, formatDate } from "@/lib/format";

interface Props {
  paymentId: string;
  orderNumber: string;
  businessName: string;
  amount: number;
  slipUrl: string | null;
  uploadedAt: string | null;
  rejectReason: string | null;
}

export function VerifyPaymentForm({
  paymentId,
  orderNumber,
  businessName,
  amount,
  slipUrl,
  uploadedAt,
  rejectReason,
}: Props) {
  const [state, action, pending] = useActionState(
    verifyPaymentAction,
    initialActionState,
  );
  const [mode, setMode] = useState<"idle" | "reject">("idle");

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brown-900">{orderNumber}</p>
          <p className="text-sm text-muted">{businessName}</p>
          <p className="mt-1 text-lg font-semibold text-brown-900">
            {formatLKR(amount)}
          </p>
          {uploadedAt && (
            <p className="text-xs text-muted">
              Uploaded {formatDate(uploadedAt)}
            </p>
          )}
        </div>
        {slipUrl && (
          <a
            href={slipUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brown-50 px-3 py-1.5 text-sm font-medium text-brown-700 hover:bg-brown-100"
          >
            <ExternalLink className="h-4 w-4" /> View slip
          </a>
        )}
      </div>

      {rejectReason && (
        <Alert variant="error" className="mt-3">
          Previously rejected: {rejectReason}
        </Alert>
      )}

      {state.success && (
        <Alert variant="success" className="mt-3">
          {state.success}
        </Alert>
      )}
      {state.error && (
        <Alert variant="error" className="mt-3">
          {state.error}
        </Alert>
      )}

      {!state.success && (
        <form action={action} className="mt-4">
          <input type="hidden" name="paymentId" value={paymentId} />
          {mode === "reject" && (
            <Field
              label="Rejection reason"
              htmlFor="reason"
              required
              className="mb-3"
            >
              <Textarea id="reason" name="reason" rows={2} required />
            </Field>
          )}
          <div className="flex gap-2">
            {mode !== "reject" && (
              <Button
                type="submit"
                name="action"
                value="approve"
                disabled={pending}
                className="gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                {pending ? "Verifying…" : "Approve"}
              </Button>
            )}
            {mode === "reject" ? (
              <>
                <Button
                  type="submit"
                  name="action"
                  value="reject"
                  variant="destructive"
                  disabled={pending}
                >
                  {pending ? "Rejecting…" : "Confirm reject"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode("idle")}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => setMode("reject")}
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
