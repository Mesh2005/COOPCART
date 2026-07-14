"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadSlip } from "@/lib/actions/orders";
import { initialActionState } from "@/lib/actions/state";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function SlipUpload({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(uploadSlip, initialActionState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && <Alert variant="error">{state.error}</Alert>}
      {state.success && <Alert variant="success">{state.success}</Alert>}
      <input
        type="file"
        name="slip"
        accept="image/*,application/pdf"
        required
        className="block w-full text-sm text-brown-800 file:mr-3 file:rounded-full file:border-0 file:bg-[#6f4a2e] file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-[#573a26]"
      />
      <Button type="submit" disabled={pending}>
        {pending ? (
          "Uploading…"
        ) : (
          <>
            <UploadCloud className="h-4 w-4" /> Upload payment slip
          </>
        )}
      </Button>
    </form>
  );
}
