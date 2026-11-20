"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import type {
  DashboardResponse,
  DashboardStats,
  Enquiry,
  EnquiryStatus,
  ListResponse,
} from "@/lib/types";
import Alert from "./Alert";
import EmptyState from "./EmptyState";
import EnquiryCard from "./EnquiryCard";
import Icon from "./Icon";
import Pagination from "./Pagination";

type Tab = "received" | "sent";

const statusFilters: { value: "" | EnquiryStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function EnquirySkeleton() {
  return (
    <div className="card space-y-3 p-4">
      <div className="flex gap-3">
        <div className="skeleton h-20 w-20 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-14 w-full" />
      <div className="skeleton h-8 w-40" />
    </div>
  );
}

export default function EnquiriesPage() {
  const [tab, setTab] = useState<Tab>("received");
  const [status, setStatus] = useState<"" | EnquiryStatus>("");
  const [offersOnly, setOffersOnly] = useState(false);
  const [items, setItems] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const res = await api<DashboardResponse>("/api/dashboard", {
          auth: true,
        });
        if (active) setStats(res.data.stats);
      } catch {
        if (active) setStats(null);
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;

    const loadEnquiries = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "8");
        if (status) params.set("status", status);
        if (offersOnly && tab === "received") {
          params.set("offersOnly", "true");
        }

        const res = await api<ListResponse<Enquiry>>(
          `/api/enquiries/${tab}?${params.toString()}`,
          { auth: true }
        );

        if (!active) return;
        setItems(res.data);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load enquiries"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadEnquiries();

    return () => {
      active = false;
    };
  }, [tab, status, offersOnly, page, reloadKey]);

  const changeTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setStatus("");
    setOffersOnly(false);
    setPage(1);
    setItems([]);
  };

  const changeStatus = (next: "" | EnquiryStatus) => {
    setStatus(next);
    setPage(1);
    setItems([]);
  };

  const updateItem = (updated: Enquiry) => {
    setItems((current) =>
      current.map((item) => (item._id === updated._id ? updated : item))
    );
  };

  const refresh = () => {
    setReloadKey((key) => key + 1);
  };

  const receivedCount = stats?.receivedEnquiries ?? 0;
  const sentCount = stats?.sentEnquiries ?? 0;
  const pendingCount = stats?.pendingOffers ?? 0;

  return (
    <div className="container-page space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Offers & enquiries</p>
          <h1 className="page-title mt-1">Your deal room</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review offers, reserve items and keep track of everything you have
            sent.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            className="btn btn-secondary"
            disabled={loading}
          >
            <Icon
              name="refresh"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link href="/" className="btn btn-secondary">
            Browse listings
          </Link>
          <Link href="/listings/new" className="btn btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Sell an item
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon name="inbox" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-zinc-900">
              {receivedCount}
            </p>
            <p className="text-xs text-zinc-500">Received enquiries</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Icon name="clock" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-zinc-900">
              {pendingCount}
            </p>
            <p className="text-xs text-zinc-500">Offers awaiting your reply</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Icon name="send" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-zinc-900">{sentCount}</p>
            <p className="text-xs text-zinc-500">Enquiries you sent</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => changeTab("received")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                tab === "received"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon name="inbox" className="h-4 w-4" />
              Received
              <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700">
                {receivedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => changeTab("sent")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                tab === "sent"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon name="send" className="h-4 w-4" />
              Sent
              <span className="rounded-full bg-zinc-200 px-1.5 text-[10px] font-bold text-zinc-600">
                {sentCount}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => changeStatus(filter.value)}
                className={`chip ${
                  status === filter.value ? "chip-active" : ""
                }`}
              >
                {filter.label}
              </button>
            ))}

            {tab === "received" ? (
              <button
                type="button"
                onClick={() => {
                  setOffersOnly((value) => !value);
                  setPage(1);
                  setItems([]);
                }}
                className={`chip ${offersOnly ? "chip-active" : ""}`}
              >
                <Icon name="tag" className="h-3.5 w-3.5" />
                With offers
              </button>
            ) : null}
          </div>
        </div>

        {tab === "received" ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm leading-6 text-indigo-800">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-bold">Accepting reserves the item.</span>{" "}
              Other pending offers are closed automatically, new enquiries pause
              until you reopen the listing, and contact details are shared with
              the buyer.
            </p>
          </div>
        ) : null}
      </div>

      {error ? <Alert message={error} /> : null}

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          <EnquirySkeleton />
          <EnquirySkeleton />
          <EnquirySkeleton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={tab === "received" ? "inbox" : "send"}
          title={
            tab === "received"
              ? "No enquiries here yet"
              : "You haven't sent any enquiries"
          }
          message={
            tab === "received"
              ? offersOnly
                ? "No enquiries with an offer price match this filter."
                : "When a student contacts you about one of your listings, it will appear here."
              : "Find something you like and send the seller a message or an offer."
          }
          actionHref="/"
          actionLabel="Browse the marketplace"
        />
      ) : (
        <div className={`space-y-3 ${loading ? "opacity-60" : ""}`}>
          <p className="text-xs font-medium text-zinc-400">
            Showing {items.length} of {total}{" "}
            {tab === "received" ? "received" : "sent"} enquiries
            {status ? ` with status ${ENQUIRY_STATUS_LABELS[status]}` : ""}.
          </p>
          {items.map((enquiry) => (
            <EnquiryCard
              key={enquiry._id}
              enquiry={enquiry}
              mode={tab}
              onChanged={updateItem}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
