import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatCents(cents: number) {
  return usd.format(cents / 100);
}
