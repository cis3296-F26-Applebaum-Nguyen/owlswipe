import { Clock } from "lucide-react";
import type { Metadata } from "next";

import { IncomingRequestCard } from "@/components/orders/incoming-request-card";
import { formatPickupSlot } from "@/lib/marketplace";
import { declineReasonLabel, type OrderRequest } from "@/lib/orders";
import { getIncomingOrderRequests, getMyOrderRequests } from "@/lib/placeholder-data";
import { getRestaurant } from "@/lib/restaurants";
import { cn, formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
};

const statusStyles: Record<OrderRequest["status"], { label: string; className: string }> = {
  awaiting_seller: { label: "Waiting for seller", className: "bg-amber-400/15 text-amber-200 ring-amber-400/30" },
  accepted: { label: "Accepted", className: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30" },
  declined: { label: "Declined", className: "bg-rose-400/15 text-rose-200 ring-rose-400/30" },
};

export default async function OrdersPage() {
  const [incoming, mine] = await Promise.all([getIncomingOrderRequests(), getMyOrderRequests()]);
  const now = new Date();
  const restaurantName = (slug: string) => getRestaurant(slug)?.name ?? slug;

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Requests to accept</h2>
          <p className="text-sm text-slate-400">
            Buyers who bought your swipes. Check each order fits the budget, then accept or decline.
          </p>
        </div>
        {incoming.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
            No requests right now.
          </p>
        ) : (
          <ul className="grid gap-3">
            {incoming.map((request) => (
              <IncomingRequestCard
                key={request.id}
                pickupLabel={formatPickupSlot(new Date(request.pickupAt), now)}
                request={request}
                restaurantName={restaurantName(request.restaurantSlug)}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your purchases</h2>
        <ul className="grid gap-3">
          {mine.map((request) => {
            const status = statusStyles[request.status];
            return (
              <li className="space-y-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10" key={request.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {restaurantName(request.restaurantSlug)} · {formatCents(request.totalPriceInCents)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {formatPickupSlot(new Date(request.pickupAt), now)}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold ring-1", status.className)}>
                    {status.label}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words rounded-md bg-black/25 p-3 text-sm">
                  {request.orderDetails}
                </p>
                {request.status === "declined" ? (
                  <div className="rounded-md bg-rose-500/10 p-3 text-sm text-rose-100 ring-1 ring-rose-400/20">
                    <p className="font-medium">
                      {request.declineReason ? declineReasonLabel(request.declineReason) : "Declined by the seller"}
                    </p>
                    {request.declineNote ? <p className="mt-1 text-rose-200/80">&ldquo;{request.declineNote}&rdquo;</p> : null}
                    <p className="mt-1 text-xs text-rose-200/70">Your payment hold was released.</p>
                  </div>
                ) : request.status === "accepted" ? (
                  <p className="text-xs text-slate-400">
                    The seller will send the GrubHub order number and name at your pickup time.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Your payment is on hold until the seller responds.</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
