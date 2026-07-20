import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sheetUrl = process.env.WAITLIST_SHEET_URL;

  if (!sheetUrl) {
    return NextResponse.json(
      { error: "Server configuration error. Please try again later or email us directly." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const { firstName, lastName, email, interests, role } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const payload = {
      timestamp: new Date().toISOString(),
      firstName,
      lastName,
      email,
      interests: Array.isArray(interests) ? interests.join(", ") : interests || "",
      role: role || "",
    };

    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Apps Script error:", response.status, text);
      return NextResponse.json(
        { error: "Failed to save your information. Please try again or email us directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
