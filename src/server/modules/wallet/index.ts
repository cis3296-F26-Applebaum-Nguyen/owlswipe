export type WalletSnapshot = {
  availableInCents: number;
  pendingInCents: number;
};

export type WalletTransactionType =
  | "deposit"
  | "purchase"
  | "sale"
  | "refund"
  | "cash_out";

export type WalletTransaction = {
  id: string;
  amountInCents: number;
  type: WalletTransactionType;
  createdAt: string;
};

export interface WalletService {
  getSnapshot(): Promise<WalletSnapshot>;
  getTransactions(): Promise<WalletTransaction[]>;
  requestCashOut(amountInCents: number): Promise<void>;
}
