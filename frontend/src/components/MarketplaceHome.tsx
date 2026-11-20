"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ListResponse, Listing } from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import ListingGrid from "./ListingGrid";
import Pagination from "./Pagination";
import SearchFilters from "./SearchFilters";

const steps = [
  {
    title: "Find something useful",
    copy: "Search books, gadgets and hostel essentials listed by students around you.",
  },
  {
    title: "Send an enquiry",
    copy: "Ask a question or make an offer. The seller can accept or reply with a note.",
  },
  {
    title: "Meet and complete",
    copy: "Once accepted, contact details unlock so you can meet safely on campus.",
  },
];

const perks = [
  {
    icon: "users" as const,
    title: "Student to student",
    copy: "Trade with people from your own campus instead of strangers across the city.",
  },
  {
    icon: "shield" as const,
    title: "Private contact details",
    copy: "Phone and email are only shared when an offer is accepted. No public spamming.",
  },
  {
    icon: "sparkles" as const,
    title: "Less waste, more value",
    copy: "Pass on things you no longer need and help another student save money.",
  },
];

export default function MarketplaceHome() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryString = searchParams.toString();
  const filterParams = new URLSearchParams(queryString);
  filterParams.delete("page");
  filterParams.delete("sort");
  const isFiltered = filterParams.toString().length > 0;
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadListings = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api<ListResponse<Listing>>(
          `/api/listings${queryString ? `?${queryString}` : ""}`
        );

        if (!active) return;

        setListings(res.data);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load listings");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadListings();

    return () => {
      active = false;
    };
  }, [queryString]);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-indigo-100/60">
        <div className="absolute inset-0 surface" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

        <div className="container-page relative grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              Built for students, not strangers
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
              Buy smart.
              <br />
              <span className="text-indigo-600">Sell easy.</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
              Your campus marketplace for textbooks, calculators, furniture and
              everything in between. Fair prices, friendly faces and safe
              handovers.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-emerald-600" />
                Free to join
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-emerald-600" />
                Campus pickups
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 text-emerald-600" />
                No delivery fees
              </span>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-md sm:block lg:max-w-none">
            <div className="absolute -right-3 -top-3 h-full w-full rounded-3xl border border-indigo-200/60 bg-indigo-100/40" />
            <div className="relative rounded-3xl border border-white bg-white/90 p-6 shadow-xl shadow-indigo-100/60 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="eyebrow">How it works</p>
                <span className="badge bg-emerald-50 text-emerald-700">
                  Safe by design
                </span>
              </div>

              <ol className="mt-4 space-y-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                        {step.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500">
                <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                Contact details stay private until an offer is accepted.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-7">
        <SearchFilters />
      </div>

      <div className="container-page space-y-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title">
              {isFiltered ? "Search results" : "Fresh on campus"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {loading
                ? "Finding the best matches..."
                : `${total} item${total === 1 ? "" : "s"} available${
                    isFiltered ? " for your filters" : " right now"
                  }`}
            </p>
          </div>

          {isFiltered ? (
            <Link href="/" className="btn btn-secondary btn-small">
              <Icon name="x" className="h-3.5 w-3.5" />
              Clear filters
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-500 ring-1 ring-zinc-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live listings
            </span>
          )}
        </div>

        {error ? <Alert message={error} /> : null}

        <ListingGrid
          listings={listings}
          loading={loading}
          emptyTitle="Nothing matches yet"
          emptyMessage="Try removing a filter, searching for a broader term, or check back soon for new listings."
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
      </div>

      {!isFiltered ? (
        <section className="border-t border-zinc-200/70 bg-white/60">
          <div className="container-page py-12">
            <div className="max-w-2xl">
              <p className="eyebrow">Why CampusMarket</p>
              <h2 className="section-title mt-1">
                A better way to trade on campus
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {perks.map((perk) => (
                <div key={perk.title} className="card p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name={perk.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-bold text-zinc-900">{perk.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {perk.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
