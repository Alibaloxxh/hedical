import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
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

    const text = [
      "New contact form submission:",
      "",
      "From: " + name + " (" + email + ")",
      "Subject: " + (subject || "Not specified"),
      "",
      "Message:",
      message,
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hedical <onboarding@resend.dev>",
        to: "hedicalai@gmail.com",
        replyTo: email,
        subject: "Contact form: " + (subject || "No subject"),
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
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
