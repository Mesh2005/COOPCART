import { redirect } from "next/navigation";
import { getCart } from "@/lib/data/cart";
import { getActiveBankAccounts, getAppSettings } from "@/lib/data/settings";
import { getActiveZones, getBlackoutDates } from "@/lib/data/delivery";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const [cart, settings, zones, banks, blackouts] = await Promise.all([
    getCart(),
    getAppSettings(),
    getActiveZones(),
    getActiveBankAccounts(),
    getBlackoutDates(),
  ]);

  const minOrder = settings?.min_order_trays ?? 5;
  if (cart.lines.length === 0 || cart.totalTrays < minOrder) redirect("/app/cart");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-brown-900">Checkout</h1>
      <CheckoutForm
        lines={cart.lines.map((l) => ({ name: l.name, qty: l.qty, lineTotal: l.line_total }))}
        subtotal={cart.subtotal}
        totalTrays={cart.totalTrays}
        zones={zones.map((z) => ({
          id: z.id,
          name: z.name,
          base_fee: Number(z.base_fee),
          per_tray_fee: Number(z.per_tray_fee),
          delivery_days: z.delivery_days,
        }))}
        banks={banks.map((b) => ({
          account_name: b.account_name,
          bank_name: b.bank_name,
          branch: b.branch,
          account_number: b.account_number,
          instructions: b.instructions,
        }))}
        blackouts={blackouts}
        settings={{
          cod_enabled: settings?.cod_enabled ?? true,
          bank_transfer_enabled: settings?.bank_transfer_enabled ?? true,
          order_cutoff_time: settings?.order_cutoff_time ?? "18:00",
        }}
      />
    </div>
  );
}
