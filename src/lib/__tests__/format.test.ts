import { formatLKR, formatDate, formatDateTime } from "@/lib/format";

describe("formatLKR", () => {
  it("formats a whole amount with the Rs. prefix and thousands separators", () => {
    expect(formatLKR(1500)).toBe("Rs. 1,500");
  });

  it("uses the LKR code prefix when asked", () => {
    expect(formatLKR(1500, { code: true })).toBe("LKR 1,500");
  });

  it("keeps up to two decimal places", () => {
    expect(formatLKR(1234.5)).toBe("Rs. 1,234.5");
  });

  it("treats non-finite input as 0 (guards against NaN)", () => {
    expect(formatLKR(NaN)).toBe("Rs. 0");
  });
});

describe("formatDate", () => {
  it("renders a short day-month-year date", () => {
    // Build the date from explicit local parts so the result does not
    // depend on the machine's timezone.
    expect(formatDate(new Date(2026, 5, 19))).toBe("19 Jun 2026");
  });
});

describe("formatDateTime", () => {
  it("includes the date, the time, and an am/pm marker", () => {
    const result = formatDateTime(new Date(2026, 5, 19, 14, 30));
    expect(result).toContain("19 Jun 2026");
    expect(result).toMatch(/2:30/);
    expect(result.toLowerCase()).toContain("pm");
  });
});
