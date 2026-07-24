"use client";

import { useState, FormEvent } from "react";
import { IconMail } from "@tabler/icons-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const honeypot = formData.get("website") as string;
    if (honeypot) {
      setState("success");
      return;
    }

    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const subject = formData.get("subject") as string;
    const message = (formData.get("message") as string).trim();

    if (!name || !email || !message) {
      setErrorMessage("Name, email, and message are required.");
      setState("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setState("error");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setState("success");
      form.reset();
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  return (
    <section className="bg-gradient-to-br from-paper via-white to-paper-dark py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-lg text-muted">
            Have a question, suggestion, or interested in partnering? We&apos;d love to hear from you.
          </p>
        </div>

        {state === "success" ? (
          <div className="mt-10 rounded-xl border border-success-bg/50 bg-success-bg p-8 text-center">
            <div className="text-4xl mb-4"><IconMail size={36} /></div>
            <h2 className="text-xl font-semibold text-success-text">Message sent!</h2>
            <p className="mt-2 text-success-text">
              Thanks for reaching out. We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink">
                  Name <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink">
                  Email <span className="text-danger-text">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-ink">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
              >
                <option value="">Select a subject...</option>
                <option value="general">General inquiry</option>
                <option value="support">Support</option>
                <option value="partnership">Partnership</option>
                <option value="press">Press</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-ink">
                Message <span className="text-danger-text">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                placeholder="How can we help?"
              />
            </div>

            {state === "error" && (
              <div className="rounded-lg border border-danger-bg/50 bg-danger-bg p-4 text-sm text-danger-text" role="alert">
                {errorMessage}
                <p className="mt-2">
                  You can also email us directly at{" "}
                  <a href={"mailto:" + "hedicalai" + "@" + "gmail.com"} className="underline">{"hedicalai" + "@" + "gmail.com"}</a>.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full rounded-lg bg-teal px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-teal-light active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {state === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
