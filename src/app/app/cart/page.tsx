import { getCart } from "@/lib/data/cart";
import { getAppSettings } from "@/lib/data/settings";
import { CartView } from "@/components/cart/cart-view";

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getAppSettings()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-brown-900">Your cart</h1>
      <CartView initialLines={cart.lines} minOrder={settings?.min_order_trays ?? 5} />
    </div>
  );
}
