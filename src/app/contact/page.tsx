import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Contact",
  description: "Have a question, suggestion, or interested in partnering? Get in touch with the Hedical team.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
