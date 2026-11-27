import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Marketplace",
};

export default function MarketplacePage() {
  return (
    <PagePlaceholder
      description="Browse available meal swipes by location, time, and price."
      title="Marketplace"
    />
  );
}
