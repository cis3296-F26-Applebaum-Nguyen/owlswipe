import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeDashboard } from "@/components/home-dashboard";

describe("HomeDashboard", () => {
  it("shows marketplace stats, balance and main actions", () => {
    render(
      <HomeDashboard
        stats={{
          activeListings: 12,
          swipesForSale: 37,
          lowestPerSwipeInCents: 500,
          averagePerSwipeInCents: null,
        }}
        wallet={{ availableInCents: 2450, pendingInCents: 800 }}
      />,
    );

    expect(screen.getByText("Listings available").nextSibling).toHaveTextContent("12");
    expect(screen.getByText("Swipes for sale").nextSibling).toHaveTextContent("37");
    expect(screen.getByText("Lowest per swipe").nextSibling).toHaveTextContent("$5.00");
    expect(screen.getByText("Average per swipe").nextSibling).toHaveTextContent("—");
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
