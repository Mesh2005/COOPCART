import {
  BUSINESS_TYPE_LABELS,
  SIZE_GRADE_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/labels";

describe("display label maps", () => {
  it("maps business types to human labels", () => {
    expect(BUSINESS_TYPE_LABELS.bakery).toBe("Bakery");
    expect(BUSINESS_TYPE_LABELS.wholesaler).toBe("Wholesaler");
  });

  it("maps size grades to human labels", () => {
    expect(SIZE_GRADE_LABELS.extra_large).toBe("Extra Large");
  });

  it("maps order statuses to human labels", () => {
    expect(ORDER_STATUS_LABELS.out_for_delivery).toBe("Out for delivery");
    expect(ORDER_STATUS_LABELS.pending).toBe("Pending");
  });

  it("maps payment statuses to human labels", () => {
    expect(PAYMENT_STATUS_LABELS.paid_cod).toBe("Paid (COD)");
    expect(PAYMENT_STATUS_LABELS.slip_uploaded).toBe("Slip uploaded");
  });

  it("never produces an empty label", () => {
    const all = [
      ...Object.values(BUSINESS_TYPE_LABELS),
      ...Object.values(SIZE_GRADE_LABELS),
      ...Object.values(ORDER_STATUS_LABELS),
      ...Object.values(PAYMENT_STATUS_LABELS),
    ];
    for (const label of all) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
