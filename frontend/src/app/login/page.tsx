"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Alert from "@/components/Alert";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";

const demoAccounts = [
  "arjun@campus.edu",
  "priya@campus.edu",
  "rahul@campus.edu",
];

const benefits = [
  "Buy and sell with students you can actually meet on campus",
  "Offers automatically reserve the item for the buyer",
  "Contact details stay private until an offer is accepted",
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page max-w-5xl py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-indigo-100/40 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                <Icon name="graduation" className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                CampusMarket
              </span>
            </Link>

            <h2 className="mt-12 text-3xl font-extrabold leading-tight tracking-tight">
              Your campus,
              <br />
              one marketplace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Textbooks, calculators, furniture and everything in between -
              traded between students who share the same campus.
            </p>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm">
                  <Icon
                    name="check-circle"
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                  />
                  <span className="leading-6 text-indigo-50">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-12 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-indigo-100 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-2 font-bold text-white">
              <Icon name="shield" className="h-4 w-4 text-emerald-300" />
              Safe by design
            </div>
            <p className="mt-1.5">
              Meet in public campus spaces, inspect items before paying and
              never share OTPs or bank details.
            </p>
          </div>
        </aside>

        <div className="p-6 sm:p-8 lg:p-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Icon name="graduation" className="h-4 w-4" />
            </span>
            <span className="font-extrabold text-zinc-900">
              Campus<span className="text-indigo-600">Market</span>
            </span>
          </Link>

          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Log in to your account
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Manage your listings, offers and messages.
            </p>
          </div>

          {error ? (
            <div className="mt-4">
              <Alert message={error} />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                required
                autoComplete="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Log in"}
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Demo accounts
              </p>
              <p className="text-[11px] text-zinc-400">
                Password: <strong>password123</strong>
              </p>
            </div>

            <div className="mt-2 grid gap-1.5">
              {demoAccounts.map((demoEmail) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword("password123");
                  }}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-700"
                >
                  {demoEmail}
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
