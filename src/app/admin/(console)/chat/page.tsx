import { requireStaff } from "@/lib/auth";
import { SupportInbox } from "@/components/admin/support-inbox";

export default async function AdminChatPage() {
  await requireStaff();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-brown-900">Live support</h1>
        <p className="mt-1 text-sm text-muted">
          Chat with customers in real time. New messages appear automatically.
        </p>
      </div>
      <SupportInbox />
    </div>
  );
}
