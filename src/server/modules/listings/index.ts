export type ListingStatus = "available" | "sold_out" | "cancelled" | "expired";

export type ListingSummary = {
  id: string;
  sellerId: string;
  location: string;
  availableAt: string;
  quantityAvailable: number;
  priceInCents: number;
  status: ListingStatus;
};

export type CreateListingInput = Pick<
  ListingSummary,
  "location" | "availableAt" | "quantityAvailable" | "priceInCents"
>;

export interface ListingsService {
  listAvailable(): Promise<ListingSummary[]>;
  create(input: CreateListingInput): Promise<ListingSummary>;
  cancel(listingId: string): Promise<void>;
}
