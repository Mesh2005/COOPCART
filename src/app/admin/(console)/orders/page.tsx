import { getAdminOrders } from "@/lib/data/admin/orders";
import { OrderKanban } from "@/components/admin/order-kanban";
import { PageHeader } from "@/components/admin/page-header";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders(undefined, 300);

  const active = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "completed",
  );
  const delivered = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${active.length} active · ${delivered.length} delivered`}
      />
      <OrderKanban orders={orders} />
    </div>
  );
}
