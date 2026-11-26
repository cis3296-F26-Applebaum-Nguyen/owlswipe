import "server-only";

import Stripe from "stripe";

import { getServerEnv } from "@/lib/env/server";

let stripe: Stripe | undefined;

export function getStripeClient() {
  if (!stripe) {
    const env = getServerEnv();
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      appInfo: {
        name: "OwlSwipe",
      },
    });
  }

  return stripe;
}
