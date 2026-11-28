/**
 * After checkout, an order waits for the seller. They read the buyer's order, check the
 * real price in GrubHub, and accept it or decline it with a reason (the payment hold is
 * then released).
 */
export type OrderRequestStatus = "awaiting_seller" | "accepted" | "declined";

export const declineReasons = [
  { value: "over_budget", label: "Doesn't fit the swipe budget" },
  { value: "item_unavailable", label: "An item isn't available" },
  { value: "unclear", label: "Order is unclear" },
  { value: "other", label: "Other" },
] as const;

export type DeclineReason = (typeof declineReasons)[number]["value"];

export type OrderRequest = {
  id: string;
  restaurantSlug: string;
  swipeCount: number;
  totalPriceInCents: number;
  /** Start of the buyer's 15-minute pickup slot (ISO). */
  pickupAt: string;
  /** Exactly what the buyer wants, typed at checkout. */
  orderDetails: string;
  /** Swipe value × swipe count at the pickup time. */
  budgetInCents: number;
  buyerFirstName: string;
  status: OrderRequestStatus;
  declineReason?: DeclineReason;
  /** Optional note from the seller, shown to the buyer. */
  declineNote?: string;
};

export function declineReasonLabel(reason: DeclineReason) {
  return declineReasons.find((option) => option.value === reason)?.label ?? "Declined";
}

export const DECLINE_NOTE_MAX_LENGTH = 200;
