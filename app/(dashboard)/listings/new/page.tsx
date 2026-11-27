import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Sell a swipe",
};

export default function NewListingPage() {
  return (
    <PagePlaceholder
      description="Create a listing with a location, availability, quantity, and price."
      title="Sell a swipe"
    />
  );
}
