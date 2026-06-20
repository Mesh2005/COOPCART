import { BarChart3, Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { getReportData } from "@/lib/data/admin/reports";
import { StatCard } from "@/components/admin/stat-card";
import { PageHeader } from "@/components/admin/page-header";
import {
  RevenueAreaChart,
  GradeBarChart,
  PaymentPieChart,
} from "@/components/admin/revenue-chart";
import { formatLKR } from "@/lib/format";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = parseInt(daysParam ?? "30", 10);
  const validDays = [7, 14, 30, 90].includes(days) ? days : 30;
  const data = await getReportData(validDays);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Reports"
          description={`Last ${validDays} days · cancelled orders excluded`}
        />
        <div className="flex gap-1.5 text-sm">
          {[7, 14, 30, 90].map((d) => (
            <a
              key={d}
              href={`?days=${d}`}
              className={
                d === validDays
                  ? "rounded-full bg-brown-600 px-3 py-1 font-semibold text-cream"
                  : "rounded-full border border-line px-3 py-1 text-muted hover:bg-brown-50"
              }
            >
              {d}d
            </a>
          ))}
        </div>
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatLKR(data.totalRevenue)}
          icon={TrendingUp}
          accent="yolk"
        />
        <StatCard
          label="Total orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          accent="brown"
        />
        <StatCard
          label="Trays sold"
          value={data.totalTrays}
          icon={Package}
          accent="sage"
        />
        <StatCard
          label="Avg. order value"
          value={formatLKR(data.avgOrderValue)}
          icon={BarChart3}
          accent="brown"
        />
      </div>

      {data.pendingPayments > 0 || data.pendingOrders > 0 ? (
        <div className="rounded-2xl border border-yolk-300 bg-yolk-50 px-5 py-4 text-sm">
          {data.pendingPayments > 0 && (
            <p>
              <span className="font-semibold text-brown-900">
                {data.pendingPayments} payment{data.pendingPayments !== 1 ? "s" : ""}
              </span>{" "}
              pending verification.{" "}
              <a href="/admin/payments" className="font-medium text-brown-700 underline">
                Review
              </a>
            </p>
          )}
          {data.pendingOrders > 0 && (
            <p className="mt-1">
              <span className="font-semibold text-brown-900">
                {data.pendingOrders} order{data.pendingOrders !== 1 ? "s" : ""}
              </span>{" "}
              pending confirmation.{" "}
              <a href="/admin/orders" className="font-medium text-brown-700 underline">
                View board
              </a>
            </p>
          )}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-brown-900">
            Revenue over time
          </h2>
          {data.daily.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No orders in this period.</p>
          ) : (
            <RevenueAreaChart data={data.daily} />
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-brown-900">
            Revenue by grade
          </h2>
          {data.byGrade.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No sales data.</p>
          ) : (
            <GradeBarChart data={data.byGrade} />
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-brown-900">
            Payment methods
          </h2>
          {data.byPaymentMethod.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No data.</p>
          ) : (
            <PaymentPieChart data={data.byPaymentMethod} />
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-brown-900">
            Grade breakdown
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="pb-2">Grade</th>
                <th className="pb-2 text-right">Trays</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.byGrade.map((g) => (
                <tr key={g.grade}>
                  <td className="py-2.5 font-medium text-brown-900">{g.grade}</td>
                  <td className="py-2.5 text-right text-muted">{g.trays}</td>
                  <td className="py-2.5 text-right font-medium text-brown-800">
                    {formatLKR(g.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
