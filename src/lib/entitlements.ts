import { createClient } from "@/lib/supabase/server";

export interface EntitlementResult {
  allowed: boolean;
  reason: "ok" | "no_subscription" | "no_credits" | "not_authenticated";
}

export async function checkEntitlement(
  userId: string | undefined,
  product: "bill_navigator" | "doc_tool" | "polypharmacy",
  skipCache?: boolean
): Promise<EntitlementResult> {
  if (!userId) {
    return { allowed: false, reason: "not_authenticated" };
  }

  const supabase = await createClient();

  // Check for active unlimited subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .eq("plan", "unlimited")
    .eq("status", "active")
    .maybeSingle();

  if (sub && sub.status === "active") {
    if (!sub.current_period_end || new Date(sub.current_period_end) > new Date()) {
      return { allowed: true, reason: "ok" };
    }
  }

  // Check and decrement a credit
  const { data: credit } = await supabase
    .from("credits")
    .select("id, remaining_count")
    .eq("user_id", userId)
    .eq("product", product)
    .maybeSingle();

  if (!credit || credit.remaining_count < 1) {
    return { allowed: false, reason: "no_credits" };
  }

  const { error: updateError } = await supabase
    .from("credits")
    .update({ remaining_count: credit.remaining_count - 1, updated_at: new Date().toISOString() })
    .eq("id", credit.id)
    .eq("remaining_count", credit.remaining_count);

  if (updateError) {
    return { allowed: false, reason: "no_credits" };
  }

  return { allowed: true, reason: "ok" };
}
