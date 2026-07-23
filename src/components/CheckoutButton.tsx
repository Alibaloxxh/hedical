"use client";

import { useState, useEffect, useCallback } from "react";
import type { Paddle } from "@paddle/paddle-js";

interface CheckoutButtonProps {
  priceId: string;
  mode: "payment" | "subscription";
  label: string;
  featured?: boolean;
  plan: "PER_USE" | "UNLIMITED";
  isCurrentPlan?: boolean;
}

export function CheckoutButton({ priceId, mode: _mode, label, featured, plan, isCurrentPlan }: CheckoutButtonProps) {
  if (isCurrentPlan) {
    return (
      <span className="mt-8 block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-muted cursor-default">
        Current Plan
      </span>
    );
  }
  const [paddle, setPaddle] = useState<Awaited<ReturnType<typeof import("@paddle/paddle-js").initializePaddle>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    import("@paddle/paddle-js").then(({ initializePaddle }) => {
      initializePaddle({
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
        token,
      }).then(setPaddle);
    });
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!priceId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        return;
      }

      if (!paddle) {
        setError("Checkout is initializing. Please try again.");
        return;
      }

      paddle.Checkout.open({ transactionId: data.transactionId });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [priceId, plan, loading, paddle]);

  if (!priceId) {
    return (
      <button
        disabled
        className="mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
        title="Payments not yet configured"
      >
        Coming soon
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading || !paddle}
        className={`mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition active:scale-[0.97] ${
          loading
            ? "bg-gray-200 text-gray-500 cursor-wait"
            : featured
              ? "bg-white text-primary hover:bg-hedical-50"
              : "bg-primary text-white hover:bg-primary-light"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {loading ? "Opening checkout..." : label}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
