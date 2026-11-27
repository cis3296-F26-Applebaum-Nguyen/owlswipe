import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  return (
    <PagePlaceholder
      description="Track purchases, sales, listings, and their current status."
      title="Recent orders"
    />
  );
}
