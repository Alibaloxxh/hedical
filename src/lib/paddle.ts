import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export function getPaddleClient() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("PADDLE_API_KEY is not configured.");
  }
  const environment = process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
  return new Paddle(apiKey, { environment });
}

export const PRICE_IDS = {
  perUse: process.env.PADDLE_PRICE_PER_USE || "",
  unlimited: process.env.PADDLE_PRICE_UNLIMITED || "",
};
