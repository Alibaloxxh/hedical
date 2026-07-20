import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Hedical account.",
  alternates: {
    canonical: `${siteUrl}/login`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16 text-center text-sm text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
