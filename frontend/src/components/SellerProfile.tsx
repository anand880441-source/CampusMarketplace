"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, assetUrl } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type {
  ListResponse,
  Listing,
  SellerProfileResponse,
} from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import ListingGrid from "./ListingGrid";
import PageLoader from "./PageLoader";
import Pagination from "./Pagination";

const STATUS_TABS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "all", label: "All" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

const emptyCopy: Record<
  StatusTab,
  { title: string; message: string }
> = {
  available: {
    title: "No available listings",
    message: "This seller does not have anything available right now.",
  },
  reserved: {
    title: "No reserved listings",
    message: "Nothing is currently reserved for a buyer.",
  },
  sold: {
    title: "No sold listings yet",
    message: "Completed deals will appear here.",
  },
  all: {
    title: "No listings yet",
    message: "This seller has not listed anything on CampusMarket yet.",
  },
};

export default function SellerProfile({ id }: { id: string }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState<SellerProfileResponse["data"] | null>(
    null
  );
  const [status, setStatus] = useState<StatusTab>("available");
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [listingsError, setListingsError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const res = await api<SellerProfileResponse>(`/api/users/${id}`);
        if (active) setProfile(res.data);
      } catch (err) {
        if (active) {
          setProfileError(
            err instanceof Error ? err.message : "Could not load seller"
          );
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    const loadListings = async () => {
      setLoadingListings(true);
      setListingsError("");

      try {
        const res = await api<ListResponse<Listing>>(
          `/api/users/${id}/listings?status=${status}&page=${page}`
        );

        if (!active) return;
        setListings(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        if (active) {
          setListingsError(
            err instanceof Error ? err.message : "Could not load seller listings"
          );
        }
      } finally {
        if (active) setLoadingListings(false);
      }
    };

    void loadListings();

    return () => {
      active = false;
    };
  }, [id, status, page]);

  if (loadingProfile) {
    return <PageLoader label="Loading seller profile..." />;
  }

  if (profileError || !profile) {
    return (
      <div className="container-page space-y-4 py-10">
        <Alert message={profileError || "Seller not found"} />
        <Link href="/" className="btn btn-primary">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const seller = profile.seller;
  const stats = profile.stats;
  const isOwnProfile = Boolean(user && user._id === seller._id);

  const tabCount = (value: StatusTab) =>
    value === "all" ? stats.total : stats[value];

  return (
    <div className="container-page space-y-6 py-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"
      >
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <Icon name="chevron-right" className="h-3 w-3 text-zinc-300" />
        <span className="font-medium text-zinc-700">Seller profile</span>
      </nav>

      <section className="card overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-700">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-3">
            {seller.profileImage ? (
              <img
                src={assetUrl(seller.profileImage)}
                alt={seller.name}
                className="h-20 w-20 rounded-2xl border-4 border-white bg-zinc-100 object-cover shadow-sm"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-extrabold text-indigo-700 shadow-sm">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            )}

            {isOwnProfile ? (
              <Link href="/profile" className="btn btn-secondary btn-small">
                <Icon name="edit" className="h-3.5 w-3.5" />
                Edit your profile
              </Link>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
                  {seller.name}
                </h1>
                {isOwnProfile ? (
                  <span className="badge bg-indigo-100 text-indigo-700">
                    You
                  </span>
                ) : null}
              </div>

              <p className="mt-0.5 text-sm text-zinc-600">
                {seller.college || "Student seller"}
                {seller.course ? ` - ${seller.course}` : ""}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                {seller.memberSince ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="calendar" className="h-3.5 w-3.5" />
                    Member since {formatDate(seller.memberSince)}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="lock" className="h-3.5 w-3.5" />
                  Contact details unlock after an offer is accepted
                </span>
              </div>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-emerald-700">
                  {stats.available}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Available
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-amber-700">
                  {stats.reserved}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Reserved
                </p>
              </div>
              <div className="rounded-xl bg-zinc-100 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-zinc-700">
                  {stats.sold}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                  Sold
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">
              {seller.name.split(" ")[0]}&apos;s listings
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {stats.total} listing{stats.total === 1 ? "" : "s"} in total
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`chip ${
                  status === tab.value ? "chip-active" : ""
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    status === tab.value
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {tabCount(tab.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {listingsError ? <Alert message={listingsError} /> : null}

        <ListingGrid
          listings={listings}
          loading={loadingListings}
          emptyTitle={emptyCopy[status].title}
          emptyMessage={emptyCopy[status].message}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
    </div>
  );
}
