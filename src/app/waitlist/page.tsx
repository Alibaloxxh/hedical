import type { Metadata } from "next";
import { WaitlistForm } from "./waitlist-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Get Early Access",
  description: "Be among the first to use Hedical. Join the waitlist for early access, launch discounts, and priority support.",
  alternates: {
    canonical: `${siteUrl}/waitlist`,
  },
};

export default function WaitlistPage() {
  return <WaitlistForm />;
}
