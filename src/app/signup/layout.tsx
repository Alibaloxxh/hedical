import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create a free Hedical account to manage your medical bills, insurance denials, and healthcare documents.",
  alternates: {
    canonical: `${siteUrl}/signup`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
