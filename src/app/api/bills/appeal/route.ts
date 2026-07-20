import { NextRequest, NextResponse } from "next/server";
import { draftAppealLetter } from "@/lib/ai/draftAppealLetter";
import { checkEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import type { BillExtraction, FlaggedIssue } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI letter generation is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to generate appeal letters." },
        { status: 401 }
      );
    }

    const { extraction, flags, patientName, claimNumber, recipientName, recipientAddress } = await request.json();

    if (!extraction || !flags || !patientName) {
      return NextResponse.json(
        { error: "Missing required fields: analysis data and patient name." },
        { status: 400 }
      );
    }

    if (!patientName.trim()) {
      return NextResponse.json(
        { error: "Patient name is required." },
        { status: 400 }
      );
    }

    const entitlement = await checkEntitlement(user.id, "bill_navigator");

    if (!entitlement.allowed) {
      const messages: Record<string, string> = {
        no_credits: "You have no credits remaining. Purchase more credits or upgrade to Unlimited.",
        not_authenticated: "Authentication required.",
        no_subscription: "You need an active plan to generate appeal letters.",
      };
      return NextResponse.json(
        { error: messages[entitlement.reason] || "Access denied." },
        { status: 402 }
      );
    }

    const letterText = await draftAppealLetter({
      extraction: extraction as BillExtraction,
      flags: flags as FlaggedIssue[],
      patientName: patientName.trim(),
      claimNumber: claimNumber || undefined,
      recipientName: recipientName || undefined,
      recipientAddress: recipientAddress || undefined,
    });

    // Log the analysis
    await supabase.from("analyses").insert({
      user_id: user.id,
      product: "bill_navigator",
      input_summary: `Appeal letter for ${patientName.trim()} (claim: ${claimNumber || "N/A"}) — ${extraction.lineItems?.length || 0} line items`,
      output_summary: `Letter of ${letterText.length} chars`,
    });

    return NextResponse.json({ success: true, letterText });
  } catch (err: any) {
    console.error("Appeal letter error:", err);
    const message = err.message || "Letter generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
