import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface GradeRevenue {
  grade: string;
  revenue: number;
  trays: number;
}

export interface PaymentMethodSplit {
  method: string;
  count: number;
  revenue: number;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalTrays: number;
  avgOrderValue: number;
  pendingPayments: number;
  pendingOrders: number;
  daily: DailyRevenue[];
  byGrade: GradeRevenue[];
  byPaymentMethod: PaymentMethodSplit[];
}

export async function getReportData(days = 30): Promise<ReportSummary> {
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const [
    { data: orders },
    { data: items },
    { data: pendingPayments },
    { data: pendingOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, placed_at, payment_method")
      .gte("placed_at", since)
      .neq("status", "cancelled"),
    supabase
      .from("order_items")
      .select(
        `line_total, qty_trays, grade_snapshot,
         orders!inner ( placed_at, status )`,
      )
      .gte("orders.placed_at", since)
      .neq("orders.status", "cancelled"),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "slip_uploaded"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const totalRevenue = (orders ?? []).reduce((s, o) => s + o.total, 0);
  const totalOrders = (orders ?? []).length;
  const totalTrays = (items ?? []).reduce((s, i: any) => s + i.qty_trays, 0);

  // daily revenue
  const dailyMap: Record<string, DailyRevenue> = {};
  (orders ?? []).forEach((o) => {
    const date = o.placed_at.split("T")[0];
    dailyMap[date] ??= { date, revenue: 0, orders: 0 };
    dailyMap[date].revenue += o.total;
    dailyMap[date].orders += 1;
  });
  const daily = Object.values(dailyMap).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // by grade
  const gradeMap: Record<string, GradeRevenue> = {};
  (items ?? []).forEach((i: any) => {
    const grade = i.grade_snapshot ?? "Unknown";
    gradeMap[grade] ??= { grade, revenue: 0, trays: 0 };
    gradeMap[grade].revenue += i.line_total;
    gradeMap[grade].trays += i.qty_trays;
  });
  const byGrade = Object.values(gradeMap).sort((a, b) => b.revenue - a.revenue);

  // by payment method
  const methodMap: Record<string, PaymentMethodSplit> = {};
  (orders ?? []).forEach((o) => {
    methodMap[o.payment_method] ??= {
      method: o.payment_method,
      count: 0,
      revenue: 0,
    };
    methodMap[o.payment_method].count += 1;
    methodMap[o.payment_method].revenue += o.total;
  });
  const byPaymentMethod = Object.values(methodMap);

  return {
    totalRevenue,
    totalOrders,
    totalTrays,
    avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
    pendingPayments: (pendingPayments as any)?.count ?? 0,
    pendingOrders: (pendingOrders as any)?.count ?? 0,
    daily,
    byGrade,
    byPaymentMethod,
  };
}
