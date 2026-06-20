import { getAdminSettings, getBankAccounts, getDeliveryZones, getBlackoutDates } from "@/lib/data/admin/settings";
import { PageHeader } from "@/components/admin/page-header";
import { AppSettingsForm } from "@/components/admin/app-settings-form";
import { BankAccountForm } from "@/components/admin/bank-account-form";
import { DeliveryZoneManager } from "@/components/admin/delivery-zone-manager";

export default async function AdminSettingsPage() {
  const [settings, banks, zones, blackouts] = await Promise.all([
    getAdminSettings(),
    getBankAccounts(),
    getDeliveryZones(),
    getBlackoutDates(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure ordering rules, bank details, and delivery zones."
      />

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-brown-900">
          Ordering & payments
        </h2>
        {settings ? (
          <AppSettingsForm settings={settings} />
        ) : (
          <p className="text-sm text-muted">Settings unavailable.</p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-brown-900">
          Bank accounts
        </h2>
        <div className="space-y-4">
          {banks.map((b) => (
            <BankAccountForm key={b.id} bank={b} />
          ))}
          <div className="border-t border-line pt-4">
            <p className="mb-3 text-sm font-semibold text-brown-900">
              Add new bank account
            </p>
            <BankAccountForm />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-brown-900">
          Delivery zones & blackouts
        </h2>
        <DeliveryZoneManager zones={zones} blackouts={blackouts} />
      </section>
    </div>
  );
}
