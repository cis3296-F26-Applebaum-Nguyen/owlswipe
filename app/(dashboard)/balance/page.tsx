import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Balance",
};

export default function BalancePage() {
  return (
    <PagePlaceholder
      description="View available funds, pending earnings, and transaction history."
      title="Balance"
    />
  );
}
