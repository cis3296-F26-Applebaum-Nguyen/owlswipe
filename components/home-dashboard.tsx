import { ArrowRight, Plus, PlusCircle, Store, Tag, TicketCheck, TrendingDown, Utensils } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceStats } from "@/lib/placeholder-data";
import { formatCents } from "@/lib/utils";
import type { WalletSnapshot } from "@/src/server/modules/wallet";

type HomeDashboardProps = {
  stats: MarketplaceStats;
  wallet: WalletSnapshot;
};

const priceOrDash = (cents: number | null) => (cents === null ? "—" : formatCents(cents));

export function HomeDashboard({ stats, wallet }: HomeDashboardProps) {
  const statCards = [
    { label: "Listings available", value: String(stats.activeListings), icon: TicketCheck },
    { label: "Swipes for sale", value: String(stats.swipesForSale), icon: Utensils },
    { label: "Lowest per swipe", value: priceOrDash(stats.lowestPerSwipeInCents), icon: TrendingDown },
    { label: "Average per swipe", value: priceOrDash(stats.averagePerSwipeInCents), icon: Tag },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1>
          <p className="max-w-xl text-slate-400">
            {stats.activeListings} {stats.activeListings === 1 ? "listing is" : "listings are"} up right now.
            Grab a cheaper meal or sell the swipes you won&apos;t use.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-200 text-blue-950 hover:bg-blue-100" size="lg">
            <Link href="/marketplace">
              <Store aria-hidden="true" />
              Browse marketplace
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            className="border border-white/25 text-slate-100 hover:bg-white/10 hover:text-white"
            size="lg"
            variant="ghost"
          >
            <Link href="/listings/new">
              <PlusCircle aria-hidden="true" />
              Sell a swipe
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="stats-heading" className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400" id="stats-heading">
          Marketplace right now
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10" key={label}>
              <dt className="flex items-center gap-2 text-sm text-slate-400">
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </dt>
              <dd className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Card className="max-w-md border-white/10 bg-slate-800/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Your balance</CardTitle>
          <CardDescription className="text-slate-400">Earnings are pending until the buyer confirms pickup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Available</p>
              <p className="text-2xl font-bold tabular-nums">{formatCents(wallet.availableInCents)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Pending</p>
              <p className="text-2xl font-bold tabular-nums text-slate-400">
                {formatCents(wallet.pendingInCents)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-500">
              <Link href="/balance#add-funds">
                <Plus aria-hidden="true" />
                Add funds
              </Link>
            </Button>
            <Button asChild className="border-white/20 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white" variant="outline">
              <Link href="/balance">View balance</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
