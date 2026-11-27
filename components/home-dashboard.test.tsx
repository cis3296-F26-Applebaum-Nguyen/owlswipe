import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeDashboard } from "@/components/home-dashboard";

describe("HomeDashboard", () => {
  it("shows marketplace stats, balance and main actions", () => {
    render(
      <HomeDashboard
        stats={{
          swipesAvailable: 37,
          activeListings: 12,
          lowestPriceInCents: 500,
          averagePriceInCents: null,
        }}
        wallet={{ availableInCents: 2450, pendingInCents: 800 }}
      />,
    );

    expect(screen.getByText("Swipes available").nextSibling).toHaveTextContent("37");
    expect(screen.getByText("Lowest price").nextSibling).toHaveTextContent("$5.00");
    expect(screen.getByText("Average price").nextSibling).toHaveTextContent("—");
    expect(screen.getByText("$24.50")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse marketplace/i })).toHaveAttribute(
      "href",
      "/marketplace",
    );
    expect(screen.getByRole("link", { name: /add funds/i })).toHaveAttribute(
      "href",
      "/balance#add-funds",
    );
  });
});
