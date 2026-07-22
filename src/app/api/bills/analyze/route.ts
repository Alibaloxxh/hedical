import { NextRequest, NextResponse } from "next/server";
import { extractBill } from "@/lib/ai/extractBill";
import { explainBill } from "@/lib/ai/explainBill";
import { flagIssues } from "@/lib/ai/flagIssues";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function logAnalysis(supabase: SupabaseClient, fields: {
  user_id: string | null;
  product: string;
  input_summary: string;
  output_summary: string | null;
  status: string;
}) {
  try {
    await supabase.from("analyses").insert(fields);
  } catch (e) {
    console.error("Failed to log analysis:", e);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI analysis is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please upload a medical bill, EOB, or denial letter." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or image (JPEG, PNG, WebP, TIFF)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const extraction = await extractBill({ base64, filename: file.name });
    const [explanation, flags] = await Promise.all([
      explainBill(extraction),
      flagIssues(extraction),
    ]);

    logAnalysis(supabase, {
      user_id: user?.id ?? null,
      product: "bill_navigator",
      input_summary: `${extraction.provider} — ${extraction.serviceDate} (${extraction.lineItems.length} line items)`,
      output_summary: `${flags.length} flags, ${extraction.totalBilled !== null ? `total ${extraction.currency || "USD"} ${extraction.totalBilled}` : "no total"}`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      analysis: { extraction, explanation, flags },
    });
  } catch (err: any) {
    console.error("Bill analysis error:", err);

    logAnalysis(supabase, {
      user_id: user?.id ?? null,
      product: "bill_navigator",
      input_summary: "Analysis failed",
      output_summary: null,
      status: "error",
    });

    const message = err.message || "Analysis failed. The file may be unreadable or the service is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
