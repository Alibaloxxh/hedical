import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ plan: null, credits: {} });
    }

    const [subResult, creditsResult] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .eq("plan", "unlimited")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("credits")
        .select("product, remaining_count")
        .eq("user_id", user.id)
        .order("product"),
    ]);

    const sub = subResult.data;
    const creditsList = creditsResult.data || [];

    const isUnlimitedActive =
      sub?.plan === "unlimited" &&
      sub?.status === "active" &&
      (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

    const credits: Record<string, number> = {};
    for (const c of creditsList) {
      credits[c.product] = c.remaining_count;
    }

    return NextResponse.json({
      plan: isUnlimitedActive ? "unlimited" : "free",
      credits,
    });
  } catch {
    return NextResponse.json({ plan: null, credits: {} });
  }
}
