import { getAdminProducts } from "@/lib/data/admin/products";
import { PageHeader } from "@/components/admin/page-header";
import { ProductCard } from "@/components/admin/product-card";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & pricing"
        description="Manage egg grades, base prices, and bulk-tier pricing."
      />
      <div className="space-y-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
