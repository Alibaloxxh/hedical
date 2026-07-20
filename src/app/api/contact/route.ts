import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const sheetUrl = process.env.CONTACT_SHEET_URL;

  if (!sheetUrl) {
    return NextResponse.json(
      { error: "Server configuration error. Please try again later or email us directly." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
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
      name,
      email,
      subject: subject || "Not specified",
      message,
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
        { error: "Failed to send your message. Please try again or email us directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
