"use client";

import { login } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Sign in</h1>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectTo} />
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
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="text-primary underline underline-offset-2">
          Create one
        </Link>
      </p>
    </div>
  );
}
