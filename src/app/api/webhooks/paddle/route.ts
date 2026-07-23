import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";

const PADDLE_LIVE_IPS = [
  "34.237.3.244", "34.195.105.136", "34.232.58.13",
  "35.155.119.135", "34.212.5.7", "52.11.166.252",
];

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured — needed for webhook handler."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function handleTransactionCompleted(
  supabase: ReturnType<typeof getServiceRoleClient>,
  event: any
) {
  const customData = event.data?.custom_data;
  if (!customData?.supabase_user_id) {
    console.warn("transaction.completed missing supabase_user_id in custom_data");
    return;
  }

  const userId = customData.supabase_user_id;
  const plan = customData.plan;

  if (plan === "PER_USE") {
    const { error } = await supabase.rpc("increment_credit", {
      p_user_id: userId,
      p_product: "bill_navigator",
      p_amount: 1,
    });
    if (error) {
      console.error("Failed to increment credit:", error);
    }
  }
}

async function handleSubscriptionCreated(
  supabase: ReturnType<typeof getServiceRoleClient>,
  event: any
) {
  const sub = event.data;
  const customData = sub.custom_data;
  if (!customData?.supabase_user_id) {
    console.warn("subscription.created missing supabase_user_id in custom_data");
    return;
  }

  const currentPeriodEnd =
    sub.current_billing_period?.ends_at ?? null;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: customData.supabase_user_id,
      plan: "unlimited",
      status: sub.status === "active" ? "active" : "incomplete",
      current_period_end: currentPeriodEnd,
      paddle_subscription_id: sub.id,
      paddle_customer_id: sub.customer_id ?? null,
    },
    { onConflict: "user_id, plan" }
  );

  if (error) {
    console.error("Failed to upsert subscription:", error);
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof getServiceRoleClient>,
  event: any
) {
  const sub = event.data;
  const subscriptionId = sub.id;

  const currentPeriodEnd =
    sub.current_billing_period?.ends_at ?? null;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: sub.status === "active" ? "active" : sub.status === "canceled" ? "canceled" : "past_due",
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", subscriptionId);

  if (error) {
    console.error("Failed to update subscription:", error);
  }
}

async function handleSubscriptionCanceled(
  supabase: ReturnType<typeof getServiceRoleClient>,
  event: any
) {
  const sub = event.data;
  const subscriptionId = sub.id;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", subscriptionId);

  if (error) {
    console.error("Failed to cancel subscription:", error);
  }
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (ip && !PADDLE_LIVE_IPS.includes(ip)) {
      console.warn(`Webhook from non-Paddle IP: ${ip}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawBytes = await request.arrayBuffer();
    const rawBody = Buffer.from(rawBytes).toString("utf-8");
    const signature = request.headers.get("paddle-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing paddle-signature header." },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("PADDLE_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Webhook secret not configured." },
        { status: 500 }
      );
    }

    const tsMatch = signature.match(/ts=(\d+)/);
    const h1Match = signature.match(/h1=([a-f0-9]+)/);
    if (!tsMatch || !h1Match) {
      console.log("=== PADDLE HEADER PARSE FAIL ===");
      console.log("RAW_HEADER:", signature);
      console.log("TS_MATCH:", tsMatch);
      console.log("H1_MATCH:", h1Match);
      return NextResponse.json(
        { error: "Invalid signature format." },
        { status: 400 }
      );
    }

    const ts = tsMatch[1];
    const h1 = h1Match[1];

    const computed = createHmac("sha256", webhookSecret)
      .update(`${ts}:${rawBody}`)
      .digest("hex");

    if (computed !== h1) {
      console.error("Webhook signature mismatch");
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;

    const supabase = getServiceRoleClient();

    switch (eventType) {
      case "transaction.completed":
        await handleTransactionCompleted(supabase, event);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(supabase, event);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(supabase, event);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(supabase, event);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
