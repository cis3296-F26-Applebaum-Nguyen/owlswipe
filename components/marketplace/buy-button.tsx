"use client";

import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatPickupSlot,
  formatSlotStart,
  type MarketplaceListing,
  ORDER_DETAILS_MAX_LENGTH,
  orderBudget,
  PICKUP_LEAD_MINUTES,
  PICKUP_SLOT_MINUTES,
  pickupSlots,
  SWIPE_VALUE_IN_CENTS,
  toSlotParam,
} from "@/lib/marketplace";
import { cn, formatCents } from "@/lib/utils";

/**
 * Buy opens a dialog where the buyer picks a 15-minute pickup slot and types the exact
 * items they want, then goes to checkout.
 */
export function BuyButton({ listing }: { listing: MarketplaceListing }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Slots depend on the current time, so they're worked out each time the dialog opens.
  const [slots, setSlots] = useState<Date[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<string>();
  // Kept between opens so the buyer doesn't lose what they typed.
  const [order, setOrder] = useState("");

  function open() {
    const openedAt = new Date();
    setNow(openedAt);
    setSlots(pickupSlots(listing, openedAt));
    setSelected(undefined);
    dialogRef.current?.showModal();
  }

  const close = () => dialogRef.current?.close();
  const selectedSlot = slots.find((slot) => toSlotParam(slot) === selected);
  // Before a time is picked, show the regular swipe value; breakfast slots lower it once chosen.
  const budget = selectedSlot
    ? orderBudget(listing, selectedSlot)
    : { totalInCents: listing.swipeCount * SWIPE_VALUE_IN_CENTS, breakfast: false };
  const swipes = `${listing.swipeCount} ${listing.swipeCount === 1 ? "swipe" : "swipes"}`;
  const canContinue = selectedSlot && order.trim();

  function goToCheckout() {
    if (!canContinue) return;
    const params = new URLSearchParams({ pickup: toSlotParam(selectedSlot), order: order.trim() });
    router.push(`/checkout/${listing.id}?${params}`);
  }

  return (
    <>
      <Button className="shrink-0 bg-blue-600 text-white hover:bg-blue-500" onClick={open} size="sm">
        Buy
      </Button>

      <dialog
        aria-labelledby={`pickup-title-${listing.id}`}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(30rem,calc(100%-2rem))] overflow-y-auto rounded-xl bg-slate-900 p-0 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop:bg-black/70"
        // Clicking the backdrop (the dialog element itself) closes it.
        onClick={(event) => event.target === event.currentTarget && close()}
        ref={dialogRef}
      >
        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" id={`pickup-title-${listing.id}`}>
                Choose a pickup time
              </h2>
            </div>
            <button
              aria-label="Close"
              className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              onClick={close}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>

          <p className="flex gap-2 rounded-lg bg-white/5 p-3 text-xs text-slate-300">
            <Clock aria-hidden="true" className="size-4 shrink-0 text-blue-300" />
            Pick a {PICKUP_SLOT_MINUTES}-minute slot at least {PICKUP_LEAD_MINUTES} minutes from now, so the
            restaurant has time to make your food.
          </p>

          {slots.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-slate-300">
              No pickup times left for this listing. The seller&apos;s window ends too soon.
            </p>
          ) : (
            <fieldset>
              <legend className="sr-only">Pickup slot</legend>
              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {slots.map((slot) => {
                  const value = toSlotParam(slot);
                  const checked = value === selected;
                  return (
                    <label
                      className={cn(
                        "cursor-pointer rounded-lg px-2 py-2 text-center text-sm tabular-nums ring-1 transition-colors",
                        checked
                          ? "bg-blue-600 font-semibold text-white ring-blue-400"
                          : "bg-white/5 text-slate-200 ring-white/10 hover:bg-white/10",
                      )}
                      key={value}
                    >
                      <input
                        checked={checked}
                        className="sr-only"
                        name={`pickup-${listing.id}`}
                        onChange={() => setSelected(value)}
                        type="radio"
                        value={value}
                      />
                      {formatSlotStart(slot)}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {slots.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor={`order-${listing.id}`}>
                What do you want?
              </label>
              <textarea
                className="block min-h-24 w-full resize-y rounded-lg bg-slate-950/60 p-3 text-sm text-white ring-1 ring-white/15 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id={`order-${listing.id}`}
                maxLength={ORDER_DETAILS_MAX_LENGTH}
                onChange={(event) => setOrder(event.target.value)}
                placeholder="Use exact item names from the menu, e.g. Spicy Chicken Sandwich Meal, medium waffle fries, lemonade, no pickles"
                value={order}
              />
              <p className="flex justify-between gap-3 text-xs text-slate-400">
                <span>
                  Keep it under <span className="font-semibold text-white">{formatCents(budget.totalInCents)}</span> (
                  {swipes}
                  {budget.breakfast ? " at breakfast prices" : ""}). The seller checks the price and can decline if it
                  doesn&apos;t fit.
                </span>
                <span className="shrink-0 tabular-nums">
                  {order.length}/{ORDER_DETAILS_MAX_LENGTH}
                </span>
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-sm text-slate-400">
              {selectedSlot ? (
                <>
                  Pickup <span className="font-medium text-white">{formatPickupSlot(selectedSlot, now)}</span>
                </>
              ) : (
                "No time selected"
              )}
            </p>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-500"
              disabled={!canContinue}
              onClick={goToCheckout}
            >
              Continue to checkout
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
