"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type {
  DashboardResponse,
  DashboardStats,
  Enquiry,
  ListResponse,
  Listing,
} from "@/lib/types";
import Alert from "./Alert";
import EmptyState from "./EmptyState";
import EnquiryCard from "./EnquiryCard";
import Icon from "./Icon";
import ListingGrid from "./ListingGrid";
import PageLoader from "./PageLoader";
import StatsCards from "./StatsCards";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReceived, setRecentReceived] = useState<Enquiry[]>([]);
  const [recentSent, setRecentSent] = useState<Enquiry[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardRes, listingsRes] = await Promise.all([
          api<DashboardResponse>("/api/dashboard", { auth: true }),
          api<ListResponse<Listing>>("/api/listings/mine?limit=6", {
            auth: true,
          }),
        ]);

        if (!active) return;

        setStats(dashboardRes.data.stats);
        setRecentReceived(dashboardRes.data.recentReceived);
        setRecentSent(dashboardRes.data.recentSent);
        setMyListings(listingsRes.data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load your dashboard"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const updateReceived = (updated: Enquiry) => {
    setRecentReceived((items) =>
      items.map((item) => (item._id === updated._id ? updated : item))
    );
  };

  const updateSent = (updated: Enquiry) => {
    setRecentSent((items) =>
      items.map((item) => (item._id === updated._id ? updated : item))
    );
  };

  const refresh = () => {
    setRefreshing(true);
    setReloadKey((key) => key + 1);
  };

  const pendingOffers = stats?.pendingOffers ?? 0;

  return (
    <div className="container-page space-y-8 py-8">
      {error ? <Alert message={error} /> : null}

      {loading && !stats ? (
        <PageLoader label="Loading your dashboard..." />
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-200/60 sm:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                  Your campus hub
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Hi {user ? user.name.split(" ")[0] : "there"}, ready to trade?
                </h1>
                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Manage your listings, respond to offers and keep every deal
                  moving in one place.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/listings/new"
                    className="btn bg-white text-indigo-700 shadow-sm hover:bg-indigo-50"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Sell an item
                  </Link>
                  <Link
                    href="/enquiries"
                    className="btn bg-indigo-500/30 text-white ring-1 ring-white/30 hover:bg-indigo-500/50"
                  >
                    <Icon name="inbox" className="h-4 w-4" />
                    Review offers
                    {pendingOffers > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950">
                        {pendingOffers}
                      </span>
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    onClick={refresh}
                    disabled={loading}
                    className="btn text-indigo-100 hover:bg-white/10"
                  >
                    <Icon
                      name="refresh"
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="w-full max-w-xs rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Icon name="shield" className="h-4 w-4 text-emerald-300" />
                  Deal safely on campus
                </div>
                <p className="mt-2 text-xs leading-5 text-indigo-100">
                  Meet in public campus spaces, inspect items before paying and
                  never share bank passwords or OTPs.
                </p>
              </div>
            </div>
          </section>

          {stats ? <StatsCards stats={stats} /> : null}

          <section id="my-listings" className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="section-title">Your listings</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Reserved items are waiting on a meetup. Mark them sold once
                  the deal is complete.
                </p>
              </div>
              <Link
                href="/listings/new"
                className="btn btn-secondary btn-small"
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                Add listing
              </Link>
            </div>

            {myListings.length > 0 ? (
              <ListingGrid listings={myListings} />
            ) : (
              <EmptyState
                icon="package"
                title="You have not listed anything yet"
                message="Turn your unused books and gadgets into cash for another student."
                actionHref="/listings/new"
                actionLabel="Create your first listing"
              />
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="section-title">Enquiries received</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Accepting an offer reserves the item for that buyer.
                  </p>
                </div>
                <Link
                  href="/enquiries"
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentReceived.length > 0 ? (
                recentReceived.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry._id}
                    enquiry={enquiry}
                    mode="received"
                    onChanged={updateReceived}
                    onRefresh={refresh}
                  />
                ))
              ) : (
                <div className="card flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="inbox" className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">
                    No enquiries yet
                  </p>
                  <p className="max-w-xs text-xs leading-5 text-zinc-500">
                    When a student contacts you about one of your listings, it
                    will show up here.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="section-title">Enquiries sent</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Track offers you made to other sellers.
                  </p>
                </div>
                <Link
                  href="/enquiries"
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {recentSent.length > 0 ? (
                recentSent.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry._id}
                    enquiry={enquiry}
                    mode="sent"
                    onChanged={updateSent}
                    onRefresh={refresh}
                  />
                ))
              ) : (
                <div className="card flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon name="send" className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">
                    Nothing sent yet
                  </p>
                  <p className="max-w-xs text-xs leading-5 text-zinc-500">
                    Found something you like? Send the seller an enquiry to
                    start the conversation.
                  </p>
                  <Link href="/" className="btn btn-secondary btn-small mt-1">
                    Browse listings
                  </Link>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
