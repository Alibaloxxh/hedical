import type { ReactNode } from "react";

interface FeatureGridProps {
  title: string;
  subtitle?: string;
  features: {
    title: string;
    description: string;
    icon: ReactNode;
  }[];
}

export function FeatureGrid({ title, subtitle, features }: FeatureGridProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted">{subtitle}</p>
          )}
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="rounded-xl border border-hairline bg-white p-6 shadow-sm">
              <div className="mb-3">{feature.icon}</div>
              <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
