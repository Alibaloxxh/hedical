import { NextRequest, NextResponse } from "next/server";
import { extractBill } from "@/lib/ai/extractBill";
import { explainBill } from "@/lib/ai/explainBill";
import { flagIssues } from "@/lib/ai/flagIssues";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
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

    // Log to analyses table if user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: logError } = await supabase.from("analyses").insert({
        user_id: user.id,
        product: "bill_navigator",
        input_summary: `${extraction.provider} — ${extraction.serviceDate} (${extraction.lineItems.length} line items)`,
        output_summary: `${flags.length} flags, ${extraction.totalBilled !== null ? `total ${extraction.currency || "USD"} ${extraction.totalBilled}` : "no total"}`,
      });
      if (logError) console.error("Failed to log analysis:", logError);
    }

    return NextResponse.json({
      success: true,
      analysis: { extraction, explanation, flags },
    });
  } catch (err: any) {
    console.error("Bill analysis error:", err);
    const message = err.message || "Analysis failed. The file may be unreadable or the service is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
