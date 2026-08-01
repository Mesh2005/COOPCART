import {
  computeDeliveryDates,
  computePickupDates,
  formatDateLabel,
} from "@/lib/delivery-dates";

// Local weekday (0 = Sun … 6 = Sat) of an ISO date, parsed the way the app does.
function weekday(iso: string): number {
  return new Date(iso + "T00:00:00").getDay();
}

describe("computeDeliveryDates", () => {
  // A fixed "now": 1 Aug 2026, 10:00 local — before the default 18:00 cut-off.
  const beforeCutoff = new Date(2026, 7, 1, 10, 0);
  const everyDay = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  it("returns only the configured delivery weekdays", () => {
    // 2 = Tuesday, 5 = Friday
    const dates = computeDeliveryDates({
      deliveryDays: ["tue", "fri"],
      now: beforeCutoff,
      count: 6,
    });
    expect(dates).toHaveLength(6);
    for (const iso of dates) {
      expect([2, 5]).toContain(weekday(iso));
    }
  });

  it("returns exactly `count` dates", () => {
    const dates = computeDeliveryDates({
      deliveryDays: everyDay,
      now: beforeCutoff,
      count: 4,
    });
    expect(dates).toHaveLength(4);
  });

  it("offers tomorrow as the earliest date before the cut-off", () => {
    const dates = computeDeliveryDates({
      deliveryDays: everyDay,
      now: beforeCutoff,
      count: 1,
    });
    expect(dates[0]).toBe("2026-08-02"); // the day after 1 Aug
  });

  it("skips to the day after tomorrow once past the cut-off", () => {
    const afterCutoff = new Date(2026, 7, 1, 19, 0); // 19:00 is past 18:00
    const dates = computeDeliveryDates({
      deliveryDays: everyDay,
      now: afterCutoff,
      count: 1,
    });
    expect(dates[0]).toBe("2026-08-03");
  });

  it("excludes blackout dates", () => {
    const dates = computeDeliveryDates({
      deliveryDays: everyDay,
      blackoutDates: ["2026-08-02"],
      now: beforeCutoff,
      count: 3,
    });
    expect(dates).not.toContain("2026-08-02");
    expect(dates[0]).toBe("2026-08-03");
  });
});

describe("computePickupDates", () => {
  const now = new Date(2026, 7, 1, 10, 0);

  it("returns consecutive calendar days starting tomorrow", () => {
    const dates = computePickupDates({ now, count: 3 });
    expect(dates).toEqual(["2026-08-02", "2026-08-03", "2026-08-04"]);
  });

  it("excludes blackout dates", () => {
    const dates = computePickupDates({
      blackoutDates: ["2026-08-03"],
      now,
      count: 3,
    });
    expect(dates).toEqual(["2026-08-02", "2026-08-04", "2026-08-05"]);
  });
});

describe("formatDateLabel", () => {
  it("formats an ISO date as a short weekday label, e.g. 'Wed 5 Aug'", () => {
    // 5 Aug 2026 is a Wednesday.
    expect(formatDateLabel("2026-08-05")).toBe("Wed 5 Aug");
  });
});
