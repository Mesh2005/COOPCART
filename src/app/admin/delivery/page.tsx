import { getDeliveryZones, getBlackoutDates } from "@/lib/data/admin/settings";
import { PageHeader } from "@/components/admin/page-header";
import { DeliveryZoneManager } from "@/components/admin/delivery-zone-manager";

export default async function AdminDeliveryPage() {
  const [zones, blackouts] = await Promise.all([
    getDeliveryZones(),
    getBlackoutDates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery"
        description="Manage delivery zones, fees, schedules, and blackout dates."
      />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <DeliveryZoneManager zones={zones} blackouts={blackouts} />
      </div>
    </div>
  );
}
