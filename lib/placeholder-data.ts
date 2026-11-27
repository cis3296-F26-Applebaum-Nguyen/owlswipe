import type { WalletSnapshot } from "@/src/server/modules/wallet";

// TODO: Replace with Supabase queries once the listings and wallet tables exist.
// These values only exist so the UI can be built before the database is ready.

export type MarketplaceStats = {
  swipesAvailable: number;
  activeListings: number;
  lowestPriceInCents: number | null;
  averagePriceInCents: number | null;
};

export async function getWalletSnapshot(): Promise<WalletSnapshot> {
  return { availableInCents: 2450, pendingInCents: 800 };
}

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  return {
    swipesAvailable: 37,
    activeListings: 12,
    lowestPriceInCents: 500,
    averagePriceInCents: 725,
  };
}
