"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-hedical-50 via-white to-hedical-100">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-7xl font-bold text-red-400">!</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-4 text-lg text-muted">
          An unexpected error occurred. Please try again or contact us if the problem persists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-light"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-zinc-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  );
}
