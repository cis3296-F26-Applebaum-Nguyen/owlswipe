"use client";

import { Clock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatPickupSlot,
  formatSlotStart,
  type MarketplaceListing,
  PICKUP_LEAD_MINUTES,
  PICKUP_SLOT_MINUTES,
  pickupSlots,
  toSlotParam,
} from "@/lib/marketplace";
import { cn } from "@/lib/utils";

/** Buy opens a dialog where the buyer picks a 15-minute pickup slot, then goes to checkout. */
export function BuyButton({ listing }: { listing: MarketplaceListing }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Slots depend on the current time, so they're worked out each time the dialog opens.
  const [slots, setSlots] = useState<Date[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<string>();

  function open() {
    const openedAt = new Date();
    setNow(openedAt);
    setSlots(pickupSlots(listing, openedAt));
    setSelected(undefined);
    dialogRef.current?.showModal();
  }

  const close = () => dialogRef.current?.close();
  const selectedSlot = slots.find((slot) => toSlotParam(slot) === selected);

  return (
    <>
      <Button className="shrink-0 bg-blue-600 text-white hover:bg-blue-500" onClick={open} size="sm">
        Buy
      </Button>

      <dialog
        aria-labelledby={`pickup-title-${listing.id}`}
        className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-xl bg-slate-900 p-0 text-slate-100 shadow-2xl ring-1 ring-white/10 backdrop:bg-black/70"
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
              disabled={!selectedSlot}
              onClick={() => router.push(`/checkout/${listing.id}?pickup=${selected}`)}
            >
              Continue to checkout
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
