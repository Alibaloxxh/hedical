import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Hedical's privacy policy — how we handle your data.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Hedical",
    description: "Hedical's privacy policy — how we handle your data.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Hedical",
    description: "Hedical's privacy policy — how we handle your data.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        {/*
          TODO: This is marketing-site boilerplate. Before the product actually launches
          and handles PHI (protected health information), engage a healthcare attorney
          to review and rewrite this policy for HIPAA compliance, data processing
          agreements, and business associate agreements.
        */}

        <div className="mt-8 prose prose-sm text-muted space-y-6">
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>
            Hedical (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
            use our website and services.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Account information (name, email address)</li>
            <li>Information you submit through our contact and waitlist forms</li>
            <li>Correspondence with us</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Provide, maintain, and improve our services</li>
            <li>Send you updates about our product launch and early access</li>
            <li>Respond to your comments, questions, and requests</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your
            information. However, no electronic transmission or storage system is 100% secure.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share
            anonymized, aggregate data for research and product improvement purposes.
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Access, update, or delete your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@hedical.com" className="text-primary underline">privacy@hedical.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
