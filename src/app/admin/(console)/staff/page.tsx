import { UserCog } from "lucide-react";
import { getStaffList } from "@/lib/data/admin/staff";
import { PageHeader } from "@/components/admin/page-header";
import { StaffTable } from "@/components/admin/staff-table";
import { InviteFormClient } from "@/components/admin/invite-form";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminStaffPage() {
  const staff = await getStaffList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & roles"
        description="Manage team access and role assignments."
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No staff members yet"
          description="Add your first team member using the form below."
        />
      ) : (
        <StaffTable staff={staff} />
      )}

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-brown-900">
          Add staff member
        </h2>
        <InviteFormClient />
      </div>
    </div>
  );
}
