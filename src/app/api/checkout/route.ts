import { NextRequest, NextResponse } from "next/server";

// TODO: replace with Payoneer Checkout integration
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Payments are not yet configured for this deployment." },
    { status: 503 }
  );
}
