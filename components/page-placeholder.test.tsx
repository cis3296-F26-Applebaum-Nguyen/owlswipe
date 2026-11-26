import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PagePlaceholder } from "@/components/page-placeholder";

describe("PagePlaceholder", () => {
  it("renders the route title and implementation boundary", () => {
    render(
      <PagePlaceholder
        description="Browse available meal swipes."
        title="Marketplace"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Marketplace" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ready for implementation")).toBeInTheDocument();
  });
});
