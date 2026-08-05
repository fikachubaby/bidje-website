"use client";

import { FormEvent, useState } from "react";
import { ADMIN_EMAIL } from "@/lib/auth/admin-auth";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { FormField, FormInput } from "@/components/admin/ui/FormField";

interface LoginFormProps {
  onLogin: (email: string, password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    if (onLogin(email, password)) {
      setError("");
      return;
    }

    setError("Incorrect email or password. Please try again.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-3xl font-black tracking-tight">
          BIDJE<span className="text-brand">.</span>
        </p>
        <h1 className="mt-6 text-2xl font-black text-neutral-900">Staff login</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sign in to manage property listings and buyer offers.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormField label="Email" htmlFor="email">
            <FormInput
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={ADMIN_EMAIL}
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <FormInput
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </FormField>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <AdminButton type="submit" className="w-full" size="lg">
            Sign in
          </AdminButton>
        </form>

        <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-xs text-neutral-600">
          Demo credentials: {ADMIN_EMAIL} / Bidje123!
        </p>
      </section>
    </main>
  );
}
