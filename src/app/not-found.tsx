import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-hedical-50 via-white to-hedical-100">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-7xl font-bold text-primary">404</div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-muted">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-light"
          >
            Go Home
          </Link>
          <Link
            href="/waitlist"
            className="rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-zinc-50"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
