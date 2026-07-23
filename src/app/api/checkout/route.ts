import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaddleClient, PRICE_IDS } from "@/lib/paddle";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to purchase." },
        { status: 401 }
      );
    }

    const { priceId, plan } = await request.json();

    if (!priceId || !plan) {
      return NextResponse.json(
        { error: "Missing priceId or plan." },
        { status: 400 }
      );
    }

    if (priceId !== PRICE_IDS.perUse && priceId !== PRICE_IDS.unlimited) {
      return NextResponse.json(
        { error: "Invalid price ID." },
        { status: 400 }
      );
    }

    if (plan !== "PER_USE" && plan !== "UNLIMITED") {
      return NextResponse.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }

    const paddle = getPaddleClient();

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ transactionId: transaction.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
