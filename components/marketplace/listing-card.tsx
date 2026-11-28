import { Clock, Utensils } from "lucide-react";

import { BuyButton } from "@/components/marketplace/buy-button";
import { formatPickupWindow, type MarketplaceListing } from "@/lib/marketplace";
import { cn, formatCents } from "@/lib/utils";

// Listings are either one or two swipes, and each size gets its own colors.
export const swipeStyles = {
  1: {
    card: "bg-sky-500/[0.06] ring-sky-400/20",
    badge: "bg-sky-400/15 text-sky-200 ring-sky-400/30",
    accent: "text-sky-300",
  },
  2: {
    card: "bg-violet-500/[0.07] ring-violet-400/20",
    badge: "bg-violet-400/15 text-violet-200 ring-violet-400/30",
    accent: "text-violet-300",
  },
} as const;

export function ListingCard({ listing, now }: { listing: MarketplaceListing; now: Date }) {
  const style = swipeStyles[listing.swipeCount === 2 ? 2 : 1];
  const pickupWindow = formatPickupWindow(listing, now);
  const swipes = `${listing.swipeCount} meal ${listing.swipeCount === 1 ? "swipe" : "swipes"}`;

  return (
    <li className={cn("flex items-center gap-4 rounded-xl p-4 ring-1", style.card)}>
      <div
        aria-hidden="true"
        className={cn("grid size-12 shrink-0 place-items-center rounded-lg ring-1", style.badge)}
      >
        <div className="flex flex-col items-center gap-0.5">
          <span className="flex">
            {Array.from({ length: listing.swipeCount }, (_, index) => (
              <Utensils className="size-4" key={index} />
            ))}
          </span>
          <span className="text-[0.55rem] font-semibold uppercase tracking-wide">
            {listing.swipeCount === 1 ? "Single" : "Double"}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
          {formatCents(listing.totalPriceInCents)}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className={cn("font-semibold", style.accent)}>
            {swipes}
            {listing.swipeCount > 1
              ? ` · ${formatCents(Math.round(listing.totalPriceInCents / listing.swipeCount))} each`
              : null}
          </span>
          <span className="flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5 shrink-0" />
            {pickupWindow}
          </span>
        </p>
      </div>

      <BuyButton listing={listing} />
    </li>
  );
}
