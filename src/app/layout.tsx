import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VisitTracker } from "@/components/VisitTracker";
import { Analytics } from "@vercel/analytics/next";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: "q123FKxkkjgWcBuVk_pnuQGz-zy2I-i2tDDhJcVihb4",
  },
  title: {
    default: "Hedical — AI-Powered Healthcare Navigation",
    template: "%s | Hedical",
  },
  description:
    "Hedical builds AI tools that help patients and caregivers understand medical bills, navigate insurance denials, simplify clinical documentation, and manage medications. Healthcare clarity for everyone.",
  keywords: [
    "medical bill help",
    "insurance denial appeal",
    "AI healthcare",
    "medical bill review",
    "EOB decoder",
    "healthcare navigation",
    "caregiver tools",
    "medication manager",
    "clinical documentation",
  ],
  openGraph: {
    title: "Hedical — AI-Powered Healthcare Navigation",
    description:
      "AI tools for medical bills, insurance denials, documentation, and medication management.",
    url: siteUrl,
    siteName: "Hedical",
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hedical — AI-Powered Healthcare Navigation",
    description:
      "AI tools for medical bills, insurance denials, documentation, and medication management.",
    images: [`${siteUrl}/images/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/hedical_icon_only.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hedical",
  url: siteUrl,
  logo: `${siteUrl}/images/hedical_medical_logo.png`,
  description:
    "AI-powered healthcare navigation tools for patients, caregivers, and providers.",
  foundingDate: "2026",
  sameAs: [
    "https://twitter.com/hedical",
    "https://linkedin.com/company/hedical",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hedicalai@gmail.com",
    url: `${siteUrl}/contact`,
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header initialUser={user ? { email: user.email ?? "" } : null} />
        <VisitTracker />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
