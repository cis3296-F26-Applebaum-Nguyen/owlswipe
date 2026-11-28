export const CAMPUS_TIME_ZONE = "America/New_York";

/** One meal swipe covers a single item or combo up to this amount. */
export const SWIPE_VALUE_IN_CENTS = 1050;

/** Temple allows at most two meal swipes per retail transaction. */
export const MAX_SWIPES_PER_LISTING = 2;

export type MarketplaceListing = {
  id: string;
  restaurantSlug: string;
  /** A listing is sold as one bundle: all of its swipes for this total price. */
  swipeCount: number;
  totalPriceInCents: number;
  /** ISO timestamps for when the seller can place the order. */
  availableFrom: string;
  availableUntil: string;
};

/** Applies to the listing's total price. */
export const priceOptions = [
  { value: "500", label: "Up to $5" },
  { value: "1000", label: "Up to $10" },
  { value: "1500", label: "Up to $15" },
  { value: "2000", label: "Up to $20" },
] as const;

// Bundles are bought whole, so this matches the bundle size exactly.
export const swipeCountOptions = [
  { value: "1", label: "1 swipe" },
  { value: "2", label: "2 swipes" },
] as const;

/** Pickups happen between 7 AM and 7 PM campus time. */
export const PICKUP_START_HOUR = 7;
export const PICKUP_END_HOUR = 19;

/** Buyers reserve a pickup slot of this length inside the seller's window (at checkout). */
export const PICKUP_SLOT_MINUTES = 15;

/** Buyers must pick a slot at least this far ahead so the restaurant has time to make the food. */
export const PICKUP_LEAD_MINUTES = 30;

/** Earliest and latest pickup times, in minutes after midnight campus time. */
export const PICKUP_DAY_START = PICKUP_START_HOUR * 60;
export const PICKUP_DAY_END = PICKUP_END_HOUR * 60;

/** The marketplace time filter moves in steps of this size. */
export const PICKUP_RANGE_STEP_MINUTES = 30;

export type ListingFilters = {
  maxPriceInCents?: number;
  swipeCount?: number;
  /** Broad pickup range the buyer is interested in, in minutes after midnight campus time. */
  pickupFrom?: number;
  pickupTo?: number;
};

/** "15:00" → 900. Undefined unless it is on a 30-minute step between 7 AM and 7 PM. */
export function parseTimeParam(value: string | undefined) {
  const match = value?.match(/^(\d{2}):(\d{2})$/);
  if (!match) return undefined;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  const inRange = minutes >= PICKUP_DAY_START && minutes <= PICKUP_DAY_END;
  return inRange && minutes % PICKUP_RANGE_STEP_MINUTES === 0 ? minutes : undefined;
}

/** 900 → "15:00", the value used in the URL. */
export function toTimeParam(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** 795 → "1:15 PM". */
export function formatClock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseListingFilters(params: SearchParams): ListingFilters {
  const price = first(params.price);
  const swipes = first(params.swipes);
  let pickupFrom = parseTimeParam(first(params.from));
  let pickupTo = parseTimeParam(first(params.to));
  if (pickupFrom !== undefined && pickupTo !== undefined && pickupFrom >= pickupTo) {
    pickupFrom = pickupTo = undefined;
  }

  return {
    maxPriceInCents: priceOptions.some((option) => option.value === price) ? Number(price) : undefined,
    swipeCount: swipeCountOptions.some((option) => option.value === swipes) ? Number(swipes) : undefined,
    pickupFrom,
    pickupTo,
  };
}

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

function campusMinuteOfDay(date: Date) {
  const parts = hourFormatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return hour * 60 + minute;
}

/** True when the listing's window and the buyer's range share at least one 15-minute slot. */
export function overlapsPickupRange(listing: MarketplaceListing, from: number, to: number) {
  const listingFrom = new Date(listing.availableFrom);
  const start = campusMinuteOfDay(listingFrom);
  const end = start + (new Date(listing.availableUntil).getTime() - listingFrom.getTime()) / 60_000;

  return Math.max(start, from) + PICKUP_SLOT_MINUTES <= Math.min(end, to);
}

export function filterListings(listings: MarketplaceListing[], filters: ListingFilters) {
  return listings
    .filter((listing) => filters.maxPriceInCents === undefined || listing.totalPriceInCents <= filters.maxPriceInCents)
    .filter((listing) => filters.swipeCount === undefined || listing.swipeCount === filters.swipeCount)
    .filter(
      (listing) =>
        (filters.pickupFrom === undefined && filters.pickupTo === undefined) ||
        overlapsPickupRange(listing, filters.pickupFrom ?? PICKUP_DAY_START, filters.pickupTo ?? PICKUP_DAY_END),
    )
    .sort((a, b) => a.totalPriceInCents - b.totalPriceInCents);
}

const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: CAMPUS_TIME_ZONE });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: CAMPUS_TIME_ZONE, weekday: "short" });
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

/** "Today", "Tomorrow" or a short weekday, in campus time. */
function campusDayLabel(date: Date, now: Date) {
  const day = dayFormatter.format(date);
  if (day === dayFormatter.format(now)) return "Today";
  if (day === dayFormatter.format(new Date(now.getTime() + 86_400_000))) return "Tomorrow";
  return weekdayFormatter.format(date);
}

export function formatPickupWindow(listing: MarketplaceListing, now = new Date()) {
  const from = new Date(listing.availableFrom);
  const until = new Date(listing.availableUntil);
  const day = dayFormatter.format(from);
  const dayLabel = campusDayLabel(from, now);

  // formatRange would print full dates when the window crosses midnight.
  const range =
    dayFormatter.format(until) === day
      ? timeFormatter.formatRange(from, until)
      : `${timeFormatter.format(from)} – ${timeFormatter.format(until)}`;

  return `${dayLabel}, ${range}`;
}

const SLOT_MS = PICKUP_SLOT_MINUTES * 60_000;

/**
 * Start times of the 15-minute pickup slots a buyer can still choose for this listing.
 * Slots sit on quarter hours inside the seller's window and start at least
 * PICKUP_LEAD_MINUTES from now. (Campus UTC offsets are whole hours, so quarter
 * hours in UTC are quarter hours in campus time too.)
 */
export function pickupSlots(listing: MarketplaceListing, now = new Date()) {
  const earliest = Math.max(
    new Date(listing.availableFrom).getTime(),
    now.getTime() + PICKUP_LEAD_MINUTES * 60_000,
  );
  const until = new Date(listing.availableUntil).getTime();
  const slots: Date[] = [];
  for (let start = Math.ceil(earliest / SLOT_MS) * SLOT_MS; start + SLOT_MS <= until; start += SLOT_MS) {
    slots.push(new Date(start));
  }
  return slots;
}

/** Slot start → "13:15", the value used in the checkout URL. */
export function toSlotParam(slot: Date) {
  return toTimeParam(campusMinuteOfDay(slot));
}

/** The chosen slot from the checkout URL, or undefined if it isn't (or is no longer) available. */
export function findPickupSlot(listing: MarketplaceListing, param: string | undefined, now = new Date()) {
  return param ? pickupSlots(listing, now).find((slot) => toSlotParam(slot) === param) : undefined;
}

/** "Today, 1:15 – 1:30 PM". */
export function formatPickupSlot(slot: Date, now = new Date()) {
  return `${campusDayLabel(slot, now)}, ${timeFormatter.formatRange(slot, new Date(slot.getTime() + SLOT_MS))}`;
}

/** "1:15 PM", for slot buttons. */
export function formatSlotStart(slot: Date) {
  return timeFormatter.format(slot);
}
