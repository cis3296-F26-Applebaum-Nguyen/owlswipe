"use client";

import { Check, Clock, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DECLINE_NOTE_MAX_LENGTH,
  type DeclineReason,
  declineReasonLabel,
  declineReasons,
  type OrderRequest,
} from "@/lib/orders";
import { formatCents } from "@/lib/utils";

type Props = {
  request: OrderRequest;
  restaurantName: string;
  /** Formatted on the server, since Node and the browser can space time ranges differently. */
  pickupLabel: string;
};

// TODO: Accept/decline only changes local state. Once orders are in Supabase, save the
// decision with a server action, and release the Stripe hold when an order is declined.
export function IncomingRequestCard({ request, restaurantName, pickupLabel }: Props) {
  const [status, setStatus] = useState(request.status);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason>();
  const [note, setNote] = useState("");

  const swipes = `${request.swipeCount} ${request.swipeCount === 1 ? "swipe" : "swipes"}`;

  return (
    <li className="space-y-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {restaurantName} · {swipes} for {formatCents(request.totalPriceInCents)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <Clock aria-hidden="true" className="size-3.5" />
            {pickupLabel} · for {request.buyerFirstName}
          </p>
        </div>
        {status === "accepted" ? (
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
            Accepted
          </span>
        ) : status === "declined" ? (
          <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/30">
            Declined{reason ? ` · ${declineReasonLabel(reason)}` : ""}
          </span>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order</p>
        <p className="mt-1 whitespace-pre-wrap break-words rounded-md bg-black/25 p-3 text-sm">{request.orderDetails}</p>
        <p className="mt-1.5 text-xs text-slate-400">
          Must fit in <span className="font-semibold text-white">{formatCents(request.budgetInCents)}</span> ({swipes}).
          Check the price in GrubHub before accepting.
        </p>
      </div>

      {status === "awaiting_seller" && !declining ? (
        <div className="flex gap-2">
          <Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => setStatus("accepted")}>
            <Check aria-hidden="true" />
            Accept
          </Button>
          <Button
            className="bg-white/10 text-slate-100 hover:bg-white/15"
            onClick={() => setDeclining(true)}
          >
            <X aria-hidden="true" />
            Decline
          </Button>
        </div>
      ) : null}

      {status === "awaiting_seller" && declining ? (
        <form
          className="space-y-3 rounded-lg bg-black/20 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (reason) setStatus("declined");
          }}
        >
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Why are you declining?</legend>
            {declineReasons.map((option) => (
              <label className="flex items-center gap-2 text-sm text-slate-200" key={option.value}>
                <input
                  checked={reason === option.value}
                  className="size-4 accent-rose-500"
                  name={`reason-${request.id}`}
                  onChange={() => setReason(option.value)}
                  type="radio"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label className="grid gap-1.5 text-sm">
            <span className="text-slate-300">
              Note to the buyer <span className="text-slate-500">(optional)</span>
            </span>
            <textarea
              className="min-h-16 rounded-md bg-slate-950/60 p-2.5 text-sm text-white ring-1 ring-white/15 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              maxLength={DECLINE_NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Large lemonade puts it over. Medium would fit."
              value={note}
            />
          </label>
          <p className="text-xs text-slate-400">The buyer&apos;s payment hold is released when you decline.</p>
          <div className="flex gap-2">
            <Button className="bg-rose-600 text-white hover:bg-rose-500" disabled={!reason} type="submit">
              Decline order
            </Button>
            <Button
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => setDeclining(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {status === "declined" && note.trim() ? (
        <p className="text-xs text-slate-400">Your note: {note.trim()}</p>
      ) : null}
    </li>
  );
}
