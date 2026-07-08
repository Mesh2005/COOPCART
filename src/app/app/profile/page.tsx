import { Building2, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { getMyBusiness, requireProfile } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-brown-900">{value || "—"}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const profile = await requireProfile();
  const business = await getMyBusiness();
  const status = business?.status ?? "pending";

  const statusChip =
    status === "approved" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
        <CheckCircle2 className="h-4 w-4" /> Approved
      </span>
    ) : status === "pending" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
        <Clock className="h-4 w-4" /> Under review
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
        <ShieldAlert className="h-4 w-4" /> {status === "rejected" ? "Not approved" : "Suspended"}
      </span>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-brown-900">Business profile</h1>
          <p className="mt-1 text-sm text-muted">Your registered wholesale account details.</p>
        </div>
        {statusChip}
      </div>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brown-500" />
          <h2 className="font-display text-lg font-semibold text-brown-900">
            {business?.business_name ?? "Your business"}
          </h2>
          {business && (
            <Badge variant="neutral" className="ml-1">
              {BUSINESS_TYPE_LABELS[business.business_type]}
            </Badge>
          )}
        </div>
        <dl className="mt-4">
          <Row label="Business name" value={business?.business_name} />
          <Row
            label="Business type"
            value={business ? BUSINESS_TYPE_LABELS[business.business_type] : null}
          />
          <Row label="Business registration no." value={business?.br_number} />
          <Row label="Member since" value={business ? formatDate(business.created_at) : null} />
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-brown-900">Contact</h2>
        <dl className="mt-4">
          <Row label="Contact person" value={business?.contact_person ?? profile.full_name} />
          <Row label="Email" value={profile.email} />
          <Row label="Phone" value={business?.phone ?? profile.phone} />
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-brown-900">Address</h2>
        <dl className="mt-4">
          <Row label="Address" value={business?.address_line1} />
          {business?.address_line2 && <Row label="Address line 2" value={business.address_line2} />}
          <Row label="City" value={business?.city} />
        </dl>
      </section>

      <p className="text-center text-xs text-muted">
        Need to update these details? Contact Abeyrathna Farms and we’ll help.
      </p>
    </div>
  );
}
