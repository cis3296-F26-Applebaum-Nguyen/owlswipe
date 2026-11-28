import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { swipeStyles } from "@/components/marketplace/listing-card";
import { RestaurantLogo } from "@/components/marketplace/restaurant-logo";
import {
  findPickupSlot,
  formatPickupSlot,
  formatPickupWindow,
  orderBudget,
  parseOrderDetails,
} from "@/lib/marketplace";
import { getListing, getWalletSnapshot } from "@/lib/placeholder-data";
import { getRestaurant } from "@/lib/restaurants";
import { cn, formatCents } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

type Props = {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const listing = await getListing((await params).listingId);
  const restaurant = listing && getRestaurant(listing.restaurantSlug);
  if (!listing || !restaurant) notFound();

  const query = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const now = new Date();
  const slot = findPickupSlot(listing, first(query.pickup), now);
  const order = parseOrderDetails(first(query.order));
  const wallet = await getWalletSnapshot();
  const style = swipeStyles[listing.swipeCount === 2 ? 2 : 1];
  const backHref = `/marketplace/${restaurant.slug}` as const;

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white" href={backHref}>
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to {restaurant.name}
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      {!slot || !order ? (
        <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
          <p className="font-medium">
            {!slot ? "That pickup time isn't available anymore." : "Tell the seller what you want to order."}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {!slot ? "Slots need to be at least 30 minutes away." : "Click Buy again and fill in your order."}
          </p>
          <Link className="mt-3 inline-block text-sm text-blue-300 hover:text-blue-200" href={backHref}>
            Choose another time
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Summary comes first on phones; on desktop it moves to the right column. */}
          <aside className="space-y-4 rounded-xl bg-white/5 p-5 ring-1 ring-white/10 lg:sticky lg:top-6 lg:order-last">
            <h2 className="font-semibold">Order summary</h2>

            <div className="flex items-center gap-3">
              <RestaurantLogo className="size-11" restaurant={restaurant} />
              <div className="min-w-0">
                <p className="font-medium">{restaurant.name}</p>
                {restaurant.location ? <p className="text-xs text-slate-400">{restaurant.location}</p> : null}
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Bundle</dt>
                <dd className={cn("font-medium", style.accent)}>
                  {listing.swipeCount} meal {listing.swipeCount === 1 ? "swipe" : "swipes"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Pickup</dt>
                <dd className="text-right">
                  <span className="font-medium">{formatPickupSlot(slot, now)}</span>
                  <Link className="ml-2 text-xs text-blue-300 hover:text-blue-200" href={backHref}>
                    Change
                  </Link>
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex justify-between gap-4 text-slate-400">
                  Your order
                  <Link className="text-xs text-blue-300 hover:text-blue-200" href={backHref}>
                    Change
                  </Link>
                </dt>
                <dd className="whitespace-pre-wrap break-words rounded-md bg-black/20 p-2.5 text-slate-100">{order}</dd>
                <dd className="text-xs text-slate-400">
                  Budget: up to {formatCents(orderBudget(listing, slot).totalInCents)}
                  {orderBudget(listing, slot).breakfast ? " (breakfast swipe value)" : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Seller window</dt>
                <dd className="text-right text-slate-300">{formatPickupWindow(listing, now)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="text-2xl font-extrabold tabular-nums">{formatCents(listing.totalPriceInCents)}</dd>
              </div>
            </dl>

            <div className="space-y-2 rounded-lg bg-black/20 p-3 text-xs text-slate-300">
              <p className="flex items-center gap-1.5 font-medium text-white">
                <ShieldCheck aria-hidden="true" className="size-4 text-emerald-300" />
                Payment held until pickup
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>The seller checks your order and accepts it. If it doesn&apos;t fit the budget, they decline and the hold is released.</li>
                <li>At your pickup time, they place the GrubHub order and send you the order number and name.</li>
                <li>You&apos;re charged only after you confirm pickup.</li>
              </ol>
            </div>
          </aside>

          <CheckoutForm balanceInCents={wallet.availableInCents} totalInCents={listing.totalPriceInCents} />
        </div>
      )}
    </div>
  );
}
