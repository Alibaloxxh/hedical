"use client";

import { signup } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, { error: "", success: undefined });

  if (state?.success) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 sm:px-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-muted">
          We sent a confirmation link. Click it to activate your account, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Create an account</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted">At least 6 characters</p>
        </div>

        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
