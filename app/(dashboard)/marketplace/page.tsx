import { ChevronRight, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { RestaurantLogo } from "@/components/marketplace/restaurant-logo";
import { getListingCountsByRestaurant } from "@/lib/placeholder-data";
import { restaurants } from "@/lib/restaurants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketplace",
};

export default async function MarketplacePage() {
  const counts = await getListingCountsByRestaurant();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-slate-400">Pick a restaurant to see the meal swipes students are selling.</p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {restaurants.map((restaurant) => {
          const count = counts.get(restaurant.slug) ?? 0;

          return (
            <li className="min-w-0" key={restaurant.slug}>
              <Link
                className={cn(
                  "flex items-center gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10",
                  count === 0 && "opacity-60",
                )}
                href={`/marketplace/${restaurant.slug}`}
              >
                <RestaurantLogo restaurant={restaurant} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{restaurant.name}</p>
                  {restaurant.location ? (
                    <p className="truncate text-sm text-slate-400">{restaurant.location}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
                    count > 0 ? "bg-blue-500/20 text-blue-200" : "bg-white/5 text-slate-400",
                  )}
                >
                  <ReceiptText aria-hidden="true" className="size-3.5" />
                  {count} {count === 1 ? "listing" : "listings"}
                </span>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
