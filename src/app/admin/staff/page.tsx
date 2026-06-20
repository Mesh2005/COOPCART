import { UserCog } from "lucide-react";
import { getStaffList } from "@/lib/data/admin/staff";
import { PageHeader } from "@/components/admin/page-header";
import { StaffTable } from "@/components/admin/staff-table";
import { InviteFormClient } from "@/components/admin/invite-form";

export default async function AdminStaffPage() {
  const staff = await getStaffList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & roles"
        description="Manage team access and role assignments."
      />

      {staff.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">
          <UserCog className="mx-auto h-10 w-10 text-brown-200" />
          <p className="mt-3">No staff members yet.</p>
          <p className="mt-1 text-sm">Invite your first team member below.</p>
        </div>
      ) : (
        <StaffTable staff={staff} />
      )}

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
          Invite staff member
        </h2>
        <InviteFormClient />
      </div>
    </div>
  );
}
