import { describe, expect, it } from "vitest";

import {
  filterListings,
  findPickupSlot,
  orderBudget,
  parseOrderDetails,
  swipeValueAt,
  formatPickupSlot,
  formatPickupWindow,
  pickupSlots,
  toSlotParam,
  type MarketplaceListing,
  formatClock,
  overlapsPickupRange,
  parseListingFilters,
  parseTimeParam,
} from "@/lib/marketplace";

// November dates, so campus time is UTC-5.
const listing = (id: string, total: number, swipes: number, fromUtc: string, untilUtc: string): MarketplaceListing => ({
  id,
  restaurantSlug: "wingstop",
  totalPriceInCents: total,
  swipeCount: swipes,
  availableFrom: fromUtc,
  availableUntil: untilUtc,
});

const lunch = listing("lunch", 700, 1, "2026-11-27T17:00:00Z", "2026-11-27T18:00:00Z"); // 12–1 PM
const dinner = listing("dinner", 2000, 2, "2026-11-27T22:00:00Z", "2026-11-28T00:00:00Z"); // 5–7 PM
const breakfast = listing("breakfast", 1500, 2, "2026-11-28T13:00:00Z", "2026-11-28T15:00:00Z"); // tomorrow 8–10 AM

describe("parseListingFilters", () => {
  it("keeps known values and drops anything else", () => {
    expect(parseListingFilters({ price: "1500", swipes: "2", from: "15:00", to: "17:00" })).toEqual({
      maxPriceInCents: 1500,
      swipeCount: 2,
      pickupFrom: 900,
      pickupTo: 1020,
    });
    expect(parseListingFilters({ price: "1", swipes: "3", from: "20:00" })).toEqual({
      maxPriceInCents: undefined,
      swipeCount: undefined,
      pickupFrom: undefined,
      pickupTo: undefined,
    });
    // A backwards range is ignored.
    expect(parseListingFilters({ from: "17:00", to: "15:00" })).toMatchObject({
      pickupFrom: undefined,
      pickupTo: undefined,
    });
  });
});

describe("parseTimeParam", () => {
  it("accepts 30-minute steps from 7 AM to 7 PM", () => {
    expect(parseTimeParam("07:00")).toBe(420);
    expect(parseTimeParam("15:30")).toBe(930);
    expect(parseTimeParam("19:00")).toBe(1140);
    expect(parseTimeParam("19:30")).toBeUndefined();
    expect(parseTimeParam("12:15")).toBeUndefined();
    expect(parseTimeParam("noon")).toBeUndefined();
    expect(formatClock(795)).toBe("1:15 PM");
  });
});

describe("overlapsPickupRange", () => {
  const at = (h: number, m = 0) => h * 60 + m;

  it("needs at least one 15-minute slot shared with the seller's window", () => {
    // lunch window is 12:00–1:00 PM
    expect(overlapsPickupRange(lunch, at(11), at(14))).toBe(true);
    expect(overlapsPickupRange(lunch, at(12, 30), at(13))).toBe(true);
    expect(overlapsPickupRange(lunch, at(13), at(15))).toBe(false);
    expect(overlapsPickupRange(lunch, at(9), at(12))).toBe(false);
    expect(overlapsPickupRange(dinner, at(15), at(17))).toBe(false);
    expect(overlapsPickupRange(dinner, at(15), at(19))).toBe(true);
  });
});

describe("filterListings", () => {
  const all = [dinner, lunch, breakfast];

  it("sorts by total price when no filters are set", () => {
    expect(filterListings(all, {}).map((l) => l.id)).toEqual(["lunch", "breakfast", "dinner"]);
  });

  it("applies price, swipe count and time together", () => {
    expect(filterListings(all, { maxPriceInCents: 1500 }).map((l) => l.id)).toEqual(["lunch", "breakfast"]);
    // Bundles are bought whole, so the swipe filter is an exact match.
    expect(filterListings(all, { swipeCount: 2 }).map((l) => l.id)).toEqual(["breakfast", "dinner"]);
    expect(filterListings(all, { swipeCount: 1, maxPriceInCents: 1000, pickupFrom: 11 * 60, pickupTo: 14 * 60 }).map((l) => l.id)).toEqual([
      "lunch",
    ]);
  });
});

describe("formatPickupWindow", () => {
  const now = new Date("2026-11-27T15:00:00Z"); // 10 AM campus time

  it("labels today and tomorrow", () => {
    expect(formatPickupWindow(lunch, now)).toMatch(/^Today, 12:00\s?–\s?1:00\sPM$/);
    expect(formatPickupWindow(breakfast, now)).toMatch(/^Tomorrow, 8:00\s?–\s?10:00\sAM$/);
  });
});

describe("pickupSlots", () => {
  const params = (slots: Date[]) => slots.map(toSlotParam);

  it("offers every 15-minute slot in the window when it's far enough away", () => {
    expect(params(pickupSlots(lunch, new Date("2026-11-27T15:00:00Z")))).toEqual(["12:00", "12:15", "12:30", "12:45"]);
  });

  it("starts at least 30 minutes from now, on a quarter hour", () => {
    // 12:07 PM + 30 min = 12:37 PM → first slot 12:45 PM.
    expect(params(pickupSlots(lunch, new Date("2026-11-27T17:07:00Z")))).toEqual(["12:45"]);
    // Exactly 30 minutes ahead is allowed.
    expect(params(pickupSlots(lunch, new Date("2026-11-27T17:00:00Z")))).toEqual(["12:30", "12:45"]);
  });

  it("is empty when the window ends too soon", () => {
    expect(pickupSlots(lunch, new Date("2026-11-27T17:20:00Z"))).toEqual([]);
  });
});

describe("findPickupSlot", () => {
  const now = new Date("2026-11-27T17:00:00Z");

  it("returns the slot for a valid URL value", () => {
    expect(findPickupSlot(lunch, "12:45", now)?.toISOString()).toBe("2026-11-27T17:45:00.000Z");
  });

  it("rejects slots that are too soon, outside the window or malformed", () => {
    expect(findPickupSlot(lunch, "12:15", now)).toBeUndefined();
    expect(findPickupSlot(lunch, "13:00", now)).toBeUndefined();
    expect(findPickupSlot(lunch, "noon", now)).toBeUndefined();
    expect(findPickupSlot(lunch, undefined, now)).toBeUndefined();
  });
});

describe("formatPickupSlot", () => {
  it("shows the day and the 15-minute range", () => {
    const text = formatPickupSlot(new Date("2026-11-28T13:15:00Z"), new Date("2026-11-27T17:00:00Z"));
    expect(text.replace(/\s/g, " ")).toBe("Tomorrow, 8:15 – 8:30 AM");
  });
});

describe("swipeValueAt", () => {
  it("is the breakfast value before 11 AM campus time", () => {
    expect(swipeValueAt(new Date("2026-11-27T15:45:00Z"))).toBe(775); // 10:45 AM
    expect(swipeValueAt(new Date("2026-11-27T16:00:00Z"))).toBe(1070); // 11:00 AM
  });
});

describe("orderBudget", () => {
  it("multiplies the swipe value by the bundle size", () => {
    expect(orderBudget(breakfast, new Date("2026-11-28T13:30:00Z"))).toEqual({ totalInCents: 1550, breakfast: true });
    expect(orderBudget(dinner, new Date("2026-11-27T22:30:00Z"))).toEqual({ totalInCents: 2140, breakfast: false });
  });
});

describe("parseOrderDetails", () => {
  it("trims the text and rejects empty or too-long orders", () => {
    expect(parseOrderDetails("  8 ct Nuggets Meal  ")).toBe("8 ct Nuggets Meal");
    expect(parseOrderDetails("   ")).toBeUndefined();
    expect(parseOrderDetails(undefined)).toBeUndefined();
    expect(parseOrderDetails("x".repeat(301))).toBeUndefined();
  });
});
