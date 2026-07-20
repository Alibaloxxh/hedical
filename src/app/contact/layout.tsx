import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Hedical team. We respond within 24 hours.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact | Hedical",
    description: "Get in touch with the Hedical team. We respond within 24 hours.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Hedical",
    description: "Get in touch with the Hedical team. We respond within 24 hours.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
