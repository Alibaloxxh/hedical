"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { IconBalloon } from "@tabler/icons-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
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

    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const interests = formData.getAll("interests");
    const role = formData.get("role") as string;

    if (!firstName || !lastName || !email) {
      setErrorMessage("First name, last name, and email are required.");
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
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, interests, role }),
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
            Get early access
          </h1>
          <p className="mt-4 text-lg text-muted">
            Be among the first to use Hedical. Early access members get launch discounts and priority support.
          </p>
        </div>

        {state === "success" ? (
          <div className="mt-10 rounded-xl border border-success-bg/50 bg-success-bg p-8 text-center">
            <div className="text-4xl mb-4"><IconBalloon size={36} /></div>
            <h2 className="text-xl font-semibold text-success-text">You&apos;re on the list!</h2>
            <p className="mt-2 text-success-text">
              Thanks for joining the Hedical waitlist. We&apos;ll be in touch with early access updates.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
            {/* Honeypot — hidden from humans */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-ink">
                  First name <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-ink">
                  Last name <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email address <span className="text-danger-text">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full rounded-lg border border-hairline px-4 py-2.5 text-sm text-ink placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                placeholder="jane@example.com"
              />
            </div>
            <fieldset>
              <legend className="text-sm font-medium text-ink">
                I&apos;m interested in...
              </legend>
              <div className="mt-3 space-y-3">
                {[
                  { id: "product-bill", label: "Medical Bill & Denial Navigator" },
                  { id: "product-doc", label: "Documentation Tool" },
                  { id: "product-poly", label: "Polypharmacy Manager" },
                  { id: "product-all", label: "All of the above" },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="interests"
                      value={option.id}
                      className="h-4 w-4 rounded border-hairline text-teal focus:ring-teal"
                    />
                    <span className="text-sm text-ink">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-ink">
                I am a... <span className="text-danger-text">*</span>
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { id: "role-patient", label: "Patient / Individual" },
                  { id: "role-caregiver", label: "Family Caregiver" },
                  { id: "role-provider", label: "Healthcare Provider" },
                  { id: "role-other", label: "Other" },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="role"
                      value={option.id}
                      required
                      className="h-4 w-4 border-hairline text-teal focus:ring-teal"
                    />
                    <span className="text-sm text-ink">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {state === "error" && (
              <div className="rounded-lg border border-danger-bg/50 bg-danger-bg p-4 text-sm text-danger-text" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full rounded-lg bg-teal px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Join the Waitlist"
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          No spam. No data sharing. Unsubscribe anytime. By joining, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}
