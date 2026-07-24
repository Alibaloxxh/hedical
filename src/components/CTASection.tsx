import Link from "next/link";

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  variant?: "primary" | "secondary";
}

export function CTASection({ title, description, buttonText, buttonHref, variant = "primary" }: CTASectionProps) {
  const isPrimary = variant === "primary";

  return (
    <section className={`py-16 sm:py-24 ${isPrimary ? "bg-teal" : "bg-paper-light"}`}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${isPrimary ? "text-white" : "text-ink"}`}>
          {title}
        </h2>
        <p className={`mt-4 text-lg ${isPrimary ? "text-white/80" : "text-muted"}`}>
          {description}
        </p>
        <div className="mt-8">
          <Link
            href={buttonHref}
            className={`inline-flex items-center rounded-lg px-6 py-3 text-base font-medium shadow-sm transition-all ${
              isPrimary
                ? "bg-white text-teal hover:bg-paper-dark"
                : "bg-teal text-white hover:bg-teal-light"
            }`}
          >
            {buttonText}
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
