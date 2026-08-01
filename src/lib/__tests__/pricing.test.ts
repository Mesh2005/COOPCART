import { resolveTier, unitPriceForQty, tierRangeLabel } from "@/lib/pricing";
import type { PriceTier } from "@/lib/types";

// A small factory so each test only spells out the fields it cares about.
function tier(overrides: Partial<PriceTier>): PriceTier {
  return {
    id: "t",
    product_id: "p",
    min_qty_trays: 1,
    max_qty_trays: null,
    price_per_tray: 100,
    is_custom_quote: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// A realistic bulk-pricing ladder for one product.
const tiers: PriceTier[] = [
  tier({ id: "a", min_qty_trays: 1, max_qty_trays: 9, price_per_tray: 500 }),
  tier({ id: "b", min_qty_trays: 10, max_qty_trays: 24, price_per_tray: 450 }),
  tier({ id: "c", min_qty_trays: 25, max_qty_trays: 49, price_per_tray: 400 }),
  tier({ id: "d", min_qty_trays: 50, max_qty_trays: null, price_per_tray: 350 }),
  tier({ id: "custom", min_qty_trays: 100, is_custom_quote: true }),
];

describe("resolveTier", () => {
  it("returns null when qty is below every tier's minimum", () => {
    expect(resolveTier(tiers, 0)).toBeNull();
  });

  it("picks the tier whose range contains the quantity", () => {
    expect(resolveTier(tiers, 15)?.id).toBe("b");
    expect(resolveTier(tiers, 30)?.id).toBe("c");
  });

  it("includes the boundaries (min and max are both inclusive)", () => {
    expect(resolveTier(tiers, 10)?.id).toBe("b"); // exactly the min
    expect(resolveTier(tiers, 24)?.id).toBe("b"); // exactly the max
    expect(resolveTier(tiers, 25)?.id).toBe("c"); // next tier begins
  });

  it("uses the open-ended (max = null) tier for large quantities", () => {
    expect(resolveTier(tiers, 500)?.id).toBe("d");
  });

  it("ignores custom-quote tiers", () => {
    const onlyCustom = [tier({ min_qty_trays: 1, is_custom_quote: true })];
    expect(resolveTier(onlyCustom, 5)).toBeNull();
  });

  it("prefers the highest matching minimum when ranges overlap", () => {
    const overlapping = [
      tier({ id: "low", min_qty_trays: 1, price_per_tray: 500 }),
      tier({ id: "high", min_qty_trays: 20, price_per_tray: 300 }),
    ];
    expect(resolveTier(overlapping, 50)?.id).toBe("high");
  });
});

describe("unitPriceForQty", () => {
  it("returns the matching tier's price", () => {
    expect(unitPriceForQty(tiers, 999, 15)).toBe(450);
  });

  it("falls back to the base price when no tier matches", () => {
    expect(unitPriceForQty(tiers, 999, 0)).toBe(999);
  });

  it("returns 0 when there is neither a tier nor a base price", () => {
    expect(unitPriceForQty(tiers, null, 0)).toBe(0);
  });
});

describe("tierRangeLabel", () => {
  it("shows a range when the tier has an upper bound", () => {
    expect(tierRangeLabel(tier({ min_qty_trays: 10, max_qty_trays: 24 }))).toBe(
      "10–24 trays",
    );
  });

  it("shows a '+' label for open-ended tiers", () => {
    expect(tierRangeLabel(tier({ min_qty_trays: 50, max_qty_trays: null }))).toBe(
      "50+ trays",
    );
  });
});
