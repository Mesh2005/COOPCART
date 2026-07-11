"use client";

import { useActionState } from "react";
import {
  updateStaffRoleAction,
  deactivateStaffAction,
} from "@/lib/actions/admin/staff";
import { initialActionState } from "@/lib/actions/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { STAFF_ROLES } from "@/lib/types";
import type { StaffRow } from "@/lib/data/admin/staff";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  sales: "Sales",
  inventory: "Inventory",
  delivery: "Delivery",
};

function StaffRowActions({ member }: { member: StaffRow }) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateStaffRoleAction,
    initialActionState,
  );
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateStaffAction,
    initialActionState,
  );

  return (
    <div className="flex items-center gap-2">
      <form action={roleAction} className="flex items-center gap-2">
        <input type="hidden" name="userId" value={member.id} />
        <Select name="role" defaultValue={member.role} className="text-sm">
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="sm" disabled={rolePending}>
          {rolePending ? "…" : "Update"}
        </Button>
      </form>
      {member.role !== "admin" && (
        <form action={deactivateAction}>
          <input type="hidden" name="userId" value={member.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={deactivatePending}
          >
            Deactivate
          </Button>
        </form>
      )}
    </div>
  );
}

export function StaffTable({ staff }: { staff: StaffRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-line bg-brown-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {staff.map((m) => (
            <tr key={m.id} className="hover:bg-brown-50/50 align-middle">
              <td className="px-4 py-3 font-medium text-brown-900">
                {m.full_name ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted">{m.email}</td>
              <td className="px-4 py-3">
                <Badge variant="brand" className="capitalize">
                  {ROLE_LABELS[m.role] ?? m.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={m.is_active ? "sage" : "neutral"}>
                  {m.is_active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                {formatDate(m.created_at)}
              </td>
              <td className="px-4 py-3">
                {m.is_active && <StaffRowActions member={m} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
