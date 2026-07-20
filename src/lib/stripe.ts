import Stripe from "stripe";

export function getStripeServer() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(key);
}

export const PRICE_IDS = {
  perUse: process.env.STRIPE_PRICE_PER_USE || "",
  unlimited: process.env.STRIPE_PRICE_UNLIMITED || "",
};
