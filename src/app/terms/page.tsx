import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Hedical's terms of service — the rules governing your use of our platform.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Hedical",
    description: "Hedical's terms of service — the rules governing your use of our platform.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Hedical",
    description: "Hedical's terms of service — the rules governing your use of our platform.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function TermsPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        {/*
          TODO: This is marketing-site boilerplate. Before the product actually launches
          and handles PHI, engages users in appeals, or processes medical bills,
          engage a healthcare attorney to review these terms for compliance with
          applicable state and federal regulations.
        */}

        <div className="mt-8 prose prose-sm text-muted space-y-6">
          <h2 className="text-xl font-semibold text-ink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Hedical (&quot;the Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-ink">2. Description of Service</h2>
          <p>
            Hedical provides informational resources about medical billing, insurance navigation,
            clinical documentation, and medication management. The Service is informational and
            administrative only — it does not provide medical or legal advice.
          </p>

          <h2 className="text-xl font-semibold text-ink">3. Not Medical or Legal Advice</h2>
          <p>
            Hedical is not a substitute for professional medical advice, diagnosis, or treatment, nor
            is it a substitute for legal representation. Always consult a qualified healthcare provider
            for medical questions and a licensed attorney for legal matters.
          </p>

          <h2 className="text-xl font-semibold text-ink">4. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Provide accurate information</li>
            <li>Not use the Service for any unlawful purpose</li>
            <li>Not attempt to reverse-engineer or abuse the systems</li>
            <li>Maintain the confidentiality of your account</li>
          </ul>

          <h2 className="text-xl font-semibold text-ink">5. Intellectual Property</h2>
          <p>
            The Service, including its software and content, is owned by Hedical and
            protected by intellectual property laws.
          </p>

          <h2 className="text-xl font-semibold text-ink">6. Limitation of Liability</h2>
          <p>
            Hedical provides the Service &quot;as is&quot; without warranties of any kind. We are not liable for
            any damages arising from your use of the Service.
          </p>

          <h2 className="text-xl font-semibold text-ink">7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts for violations of these terms.
          </p>

          <h2 className="text-xl font-semibold text-ink">8. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the Service after changes
            constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-ink">9. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="/contact" className="text-teal underline">contact us</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
