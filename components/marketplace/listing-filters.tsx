"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { PickupRangeSlider } from "@/components/marketplace/pickup-range-slider";
import {
  parseListingFilters,
  PICKUP_DAY_END,
  PICKUP_DAY_START,
  priceOptions,
  swipeCountOptions,
  toTimeParam,
} from "@/lib/marketplace";

const selectFilters = [
  { param: "price", label: "Total price", anyLabel: "Any price", options: priceOptions },
  { param: "swipes", label: "Swipes", anyLabel: "Any amount", options: swipeCountOptions },
] as const;

const selectClass =
  "h-10 rounded-lg border border-white/15 bg-slate-900 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

export function ListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { pickupFrom = PICKUP_DAY_START, pickupTo = PICKUP_DAY_END } = parseListingFilters(
    Object.fromEntries(searchParams),
  );

  function update(param: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(param, value);
    else params.delete(param);
    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  }

  const commitPickup = useCallback(
    (from: number, to: number) => {
      const params = new URLSearchParams(searchParams);
      const isAnyTime = from === PICKUP_DAY_START && to === PICKUP_DAY_END;
      if (isAnyTime) {
        params.delete("from");
        params.delete("to");
      } else {
        params.set("from", toTimeParam(from));
        params.set("to", toTimeParam(to));
      }
      const query = params.toString();
      router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="grid gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 sm:grid-cols-[1fr_1fr_2fr]">
      {selectFilters.map(({ param, label, anyLabel, options }) => (
        <label className="grid content-start gap-1.5 text-sm" key={param}>
          <span className="font-medium text-slate-300">{label}</span>
          <select
            className={selectClass}
            onChange={(event) => update(param, event.target.value || undefined)}
            value={searchParams.get(param) ?? ""}
          >
            <option value="">{anyLabel}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      <PickupRangeSlider
        from={pickupFrom}
        key={`${pickupFrom}-${pickupTo}`}
        onCommit={commitPickup}
        to={pickupTo}
      />
    </div>
  );
}
