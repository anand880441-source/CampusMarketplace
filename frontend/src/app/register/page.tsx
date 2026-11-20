"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Alert from "@/components/Alert";
import Icon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";

const benefits = [
  "List your unused books, gadgets and hostel essentials for free",
  "Send offers and get instant notifications when sellers respond",
  "Contact details unlock only after an offer is accepted",
];

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        college: college.trim(),
        course: course.trim(),
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page max-w-5xl py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-indigo-100/40 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white lg:flex lg:flex-col lg:justify-between">
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
              Turn unused stuff
              <br />
              into campus cash.
            </h2>
            <p className="mt-3 text-sm leading-6 text-indigo-100">
              Join students buying and selling smarter. No delivery fees, no
              strangers across the city, just your campus.
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

          <div className="relative mt-12 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-indigo-100 ring-1 ring-white/20 backdrop-blur">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon name="sparkles" className="h-4 w-4 text-emerald-300" />
            </span>
            <p>
              <span className="font-bold text-white">Free forever.</span> No
              listing fees, no commissions, no catch.
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
            <p className="eyebrow">Join free</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              It takes less than a minute to start trading.
            </p>
          </div>

          {error ? (
            <div className="mt-4">
              <Alert message={error} />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="input"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="college">
                  College
                </label>
                <input
                  id="college"
                  className="input"
                  maxLength={150}
                  placeholder="Your college"
                  value={college}
                  onChange={(event) => setCollege(event.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="course">
                  Course
                </label>
                <input
                  id="course"
                  className="input"
                  maxLength={150}
                  placeholder="Your course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create free account"}
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>

            <p className="flex items-start gap-1.5 text-[11px] leading-4 text-zinc-400">
              <Icon name="shield" className="mt-px h-3.5 w-3.5 shrink-0" />
              Your contact details are only shared after an offer is accepted.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
