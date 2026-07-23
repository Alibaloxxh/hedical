import type { Metadata } from "next";
import Script from "next/script";
import { default as nextDynamic } from "next/dynamic";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const Footer = nextDynamic(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));
const VisitTracker = nextDynamic(() => import("@/components/VisitTracker").then((m) => ({ default: m.VisitTracker })));

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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/site.webmanifest",
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
    "https://x.com/hedical",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="gtm" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K2LSSNPR');`}
        </Script>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K2LSSNPR"
height="0" width="0" className="hidden"></iframe></noscript>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-LW5WZQFMNG" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-LW5WZQFMNG');`}
        </Script>
        <link rel="llms" href="/llms.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Header initialUser={null} />
        <VisitTracker />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
