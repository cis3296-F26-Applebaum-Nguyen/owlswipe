import { CAMPUS_TIME_ZONE, type MarketplaceListing } from "@/lib/marketplace";
import type { WalletSnapshot } from "@/src/server/modules/wallet";

// TODO: Replace with Supabase queries once the listings and wallet tables exist.
// These values only exist so the UI can be built before the database is ready.

export type MarketplaceStats = {
  activeListings: number;
  swipesForSale: number;
  lowestPerSwipeInCents: number | null;
  averagePerSwipeInCents: number | null;
};

// [restaurant, swipes in the bundle (1 or 2), total price in cents, day (0 = today, 1 = tomorrow), from hour, until hour]
// Hours are campus time and stay within the 7 AM–7 PM pickup window.
const sampleListings: [string, number, number, number, number, number][] = [
  ["chick-fil-a", 2, 1500, 0, 11, 13],
  ["chick-fil-a", 1, 700, 0, 16, 19],
  ["chick-fil-a", 2, 1300, 1, 10, 14],
  ["chick-fil-a", 1, 800, 1, 17, 19],
  ["panda-express", 2, 1600, 0, 12, 14],
  ["panda-express", 2, 1400, 1, 11, 16],
  ["wingstop", 2, 1500, 0, 15, 18],
  ["wingstop", 1, 900, 1, 12, 14],
  ["wingstop", 2, 1200, 1, 16, 19],
  ["panera-bread", 1, 800, 1, 7, 10],
  ["panera-bread", 2, 1300, 1, 12, 16],
  ["honeygrow", 2, 1700, 0, 11.5, 13.5],
  ["honeygrow", 1, 1000, 1, 17, 19],
  ["saladworks", 1, 500, 1, 11, 13],
  ["burgerfi", 2, 1500, 0, 13, 15],
  ["burgerfi", 1, 650, 1, 16.5, 18.5],
  ["which-wich", 2, 1200, 1, 10, 13],
  ["twisted-taco", 2, 1100, 0, 17, 19],
  ["twisted-taco", 1, 700, 1, 14, 16],
  ["freshens", 2, 1000, 1, 8, 10],
];

const campusDay = new Intl.DateTimeFormat("en-CA", { timeZone: CAMPUS_TIME_ZONE });
const campusOffset = new Intl.DateTimeFormat("en-US", { timeZone: CAMPUS_TIME_ZONE, timeZoneName: "longOffset" });

/** A Date for the given campus-local hour, `dayOffset` days from now. */
function campusTime(now: Date, dayOffset: number, hour: number) {
  const day = new Date(now.getTime() + dayOffset * 86_400_000);
  const date = campusDay.format(day);
  const offset = campusOffset.formatToParts(day).find((part) => part.type === "timeZoneName")!.value.slice(3);
  const minutes = Math.round(hour * 60);
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return new Date(`${date}T${hh}:${mm}:00${offset || "Z"}`);
}

function placeholderListings(now = new Date()): MarketplaceListing[] {
  return sampleListings
    .map(([restaurantSlug, swipeCount, totalPriceInCents, day, fromHour, untilHour], index) => ({
      id: `sample-${index + 1}`,
      restaurantSlug,
      swipeCount,
      totalPriceInCents,
      availableFrom: campusTime(now, day, fromHour).toISOString(),
      availableUntil: campusTime(now, day, untilHour).toISOString(),
    }))
    .filter((listing) => new Date(listing.availableUntil) > now);
}

export async function getAvailableListings(restaurantSlug?: string): Promise<MarketplaceListing[]> {
  const listings = placeholderListings();
  return restaurantSlug ? listings.filter((listing) => listing.restaurantSlug === restaurantSlug) : listings;
}

export async function getListing(id: string): Promise<MarketplaceListing | undefined> {
  return placeholderListings().find((listing) => listing.id === id);
}

export async function getListingCountsByRestaurant(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const listing of await getAvailableListings()) {
    counts.set(listing.restaurantSlug, (counts.get(listing.restaurantSlug) ?? 0) + 1);
  }
  return counts;
}

export async function getWalletSnapshot(): Promise<WalletSnapshot> {
  return { availableInCents: 2450, pendingInCents: 800 };
}

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const listings = await getAvailableListings();
  const swipes = listings.reduce((total, listing) => total + listing.swipeCount, 0);
  const totalPrice = listings.reduce((total, listing) => total + listing.totalPriceInCents, 0);
  const perSwipe = listings.map((listing) => listing.totalPriceInCents / listing.swipeCount);

  return {
    activeListings: listings.length,
    swipesForSale: swipes,
    lowestPerSwipeInCents: perSwipe.length ? Math.round(Math.min(...perSwipe)) : null,
    averagePerSwipeInCents: swipes ? Math.round(totalPrice / swipes) : null,
  };
}
