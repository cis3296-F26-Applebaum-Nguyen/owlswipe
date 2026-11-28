export type OrderStatus =
  | "payment_pending"
  // The seller still has to accept the buyer's order (see lib/orders.ts).
  | "awaiting_seller"
  | "declined"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "reported";

export type OrderSummary = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalInCents: number;
  status: OrderStatus;
  createdAt: string;
};

export interface OrdersService {
  getForCurrentUser(): Promise<OrderSummary[]>;
  reserve(listingId: string, quantity: number): Promise<OrderSummary>;
  complete(orderId: string): Promise<OrderSummary>;
  reportProblem(orderId: string, reason: string): Promise<OrderSummary>;
}
