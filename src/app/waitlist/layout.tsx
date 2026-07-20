import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Join the Waitlist",
  description:
    "Get early access to Hedical's AI-powered medical bill navigation, documentation, and medication management tools.",
  alternates: {
    canonical: `${siteUrl}/waitlist`,
  },
  openGraph: {
    title: "Join the Waitlist | Hedical",
    description:
      "Get early access to Hedical's AI-powered medical bill navigation, documentation, and medication management tools.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Waitlist | Hedical",
    description:
      "Get early access to Hedical's AI-powered medical bill navigation, documentation, and medication management tools.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
