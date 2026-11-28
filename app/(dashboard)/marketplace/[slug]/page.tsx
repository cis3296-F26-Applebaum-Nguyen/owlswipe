import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingFilters } from "@/components/marketplace/listing-filters";
import { RestaurantLogo } from "@/components/marketplace/restaurant-logo";
import {
  filterListings,
  BREAKFAST_SWIPE_VALUE_IN_CENTS,
  MAX_SWIPES_PER_LISTING,
  parseListingFilters,
  SWIPE_VALUE_IN_CENTS,
} from "@/lib/marketplace";
import { getAvailableListings } from "@/lib/placeholder-data";
import { getRestaurant } from "@/lib/restaurants";
import { formatCents } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const restaurant = getRestaurant((await params).slug);
  return { title: restaurant ? `${restaurant.name} swipes` : "Marketplace" };
}

export default async function RestaurantListingsPage({ params, searchParams }: Props) {
  const restaurant = getRestaurant((await params).slug);
  if (!restaurant) notFound();

  const allListings = await getAvailableListings(restaurant.slug);
  const listings = filterListings(allListings, parseListingFilters(await searchParams));
  const now = new Date();

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white" href="/marketplace">
        <ArrowLeft aria-hidden="true" className="size-4" />
        All restaurants
      </Link>

      <div className="flex items-center gap-4">
        <RestaurantLogo className="size-14" restaurant={restaurant} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
          {restaurant.location ? <p className="text-slate-400">{restaurant.location}</p> : null}
        </div>
      </div>

      <p className="text-sm text-slate-400">
        Each meal swipe is worth {formatCents(SWIPE_VALUE_IN_CENTS)} toward any food here (
        {formatCents(BREAKFAST_SWIPE_VALUE_IN_CENTS)} before 11 AM). Up to {MAX_SWIPES_PER_LISTING} swipes can be
        stacked in one order, and listings are sold as a bundle.
      </p>

      <Suspense>
        <ListingFilters />
      </Suspense>

      <p aria-live="polite" className="text-sm text-slate-400">
        {listings.length} of {allListings.length} {allListings.length === 1 ? "listing" : "listings"}
      </p>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
          <p className="font-medium">No swipes match these filters.</p>
          <Link
            className="mt-2 inline-block text-sm text-blue-300 hover:text-blue-200"
            href={`/marketplace/${restaurant.slug}`}
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} now={now} />
          ))}
        </ul>
      )}
    </div>
  );
}
