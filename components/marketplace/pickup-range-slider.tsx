"use client";

import { useEffect, useState } from "react";

import {
  formatClock,
  PICKUP_DAY_END,
  PICKUP_DAY_START,
  PICKUP_RANGE_STEP_MINUTES,
} from "@/lib/marketplace";

type Props = {
  from: number;
  to: number;
  onCommit: (from: number, to: number) => void;
};

const SPAN = PICKUP_DAY_END - PICKUP_DAY_START;
const percent = (minutes: number) => ((minutes - PICKUP_DAY_START) / SPAN) * 100;
const ticks = [7, 10, 13, 16, 19].map((hour) => hour * 60);
const tickLabel = (minutes: number) => formatClock(minutes).replace(":00", "");

// TODO(bug): The slider doesn't work in Firefox (works in Chromium). Not yet investigated.
// First suspects: the two overlapping range inputs rely on `pointer-events: none` on the
// input and `pointer-events: auto` on `::-moz-range-thumb` (see `.range-thumb` in
// app/globals.css). If that can't be made reliable, switch to a slider library.

/** Two-handle slider for a broad pickup range. Updates the URL shortly after the user stops dragging. */
export function PickupRangeSlider({ from, to, onCommit }: Props) {
  const [range, setRange] = useState({ from, to });

  useEffect(() => {
    if (range.from === from && range.to === to) return;
    const timer = setTimeout(() => onCommit(range.from, range.to), 300);
    return () => clearTimeout(timer);
  }, [range, from, to, onCommit]);

  const isAnyTime = range.from === PICKUP_DAY_START && range.to === PICKUP_DAY_END;

  return (
    <fieldset className="grid content-start gap-1.5 text-sm">
      <legend className="mb-1.5 flex w-full items-center justify-between font-medium text-slate-300">
        Pickup time
        <span className="font-normal tabular-nums text-slate-400">
          {isAnyTime ? "Any time" : `${formatClock(range.from)} – ${formatClock(range.to)}`}
        </span>
      </legend>

      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-500"
          style={{ left: `${percent(range.from)}%`, right: `${100 - percent(range.to)}%` }}
        />
        <input
          aria-label="Earliest pickup time"
          aria-valuetext={formatClock(range.from)}
          className="range-thumb"
          max={PICKUP_DAY_END}
          min={PICKUP_DAY_START}
          onChange={(event) =>
            setRange((current) => ({
              ...current,
              from: Math.min(Number(event.target.value), current.to - PICKUP_RANGE_STEP_MINUTES),
            }))
          }
          step={PICKUP_RANGE_STEP_MINUTES}
          type="range"
          value={range.from}
        />
        <input
          aria-label="Latest pickup time"
          aria-valuetext={formatClock(range.to)}
          className="range-thumb"
          max={PICKUP_DAY_END}
          min={PICKUP_DAY_START}
          onChange={(event) =>
            setRange((current) => ({
              ...current,
              to: Math.max(Number(event.target.value), current.from + PICKUP_RANGE_STEP_MINUTES),
            }))
          }
          step={PICKUP_RANGE_STEP_MINUTES}
          type="range"
          value={range.to}
        />
      </div>

      <div aria-hidden="true" className="relative h-4 text-xs text-slate-500">
        {ticks.map((minutes) => (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
            key={minutes}
            style={{ left: `${percent(minutes)}%` }}
          >
            {tickLabel(minutes)}
          </span>
        ))}
      </div>
    </fieldset>
  );
}
