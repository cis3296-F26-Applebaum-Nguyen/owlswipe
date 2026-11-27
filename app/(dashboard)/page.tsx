import type { Metadata } from "next";

import { HomeDashboard } from "@/components/home-dashboard";
import { getMarketplaceStats, getWalletSnapshot } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [stats, wallet] = await Promise.all([getMarketplaceStats(), getWalletSnapshot()]);

  return <HomeDashboard stats={stats} wallet={wallet} />;
}
