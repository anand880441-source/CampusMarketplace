"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import {
  ENQUIRY_STATUS_LABELS,
  LISTING_STATUS_LABELS,
} from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  statusBadgeClass,
  timeAgo,
} from "@/lib/format";
import type { Enquiry, Listing } from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import Modal from "./Modal";

type ModalKind = "accept" | "reject" | "withdraw" | "sold" | null;

export default function EnquiryCard({
  enquiry,
  mode,
  onChanged,
  onRefresh,
}: {
  enquiry: Enquiry;
  mode: "received" | "sent";
  onChanged?: (enquiry: Enquiry) => void;
  onRefresh?: () => void;
}) {
  const [current, setCurrent] = useState(enquiry);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalKind>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    setCurrent(enquiry);
  }, [enquiry]);

  const listing =
    typeof current.listing === "string" ? null : current.listing;
  const person = mode === "received" ? current.buyer : current.seller;
  const personLabel = mode === "received" ? "Buyer" : "Seller";
  const accepted = current.status === "accepted";
  const pending = current.status === "pending";

  const respond = async (status: "accepted" | "rejected", message?: string) => {
    setBusy(true);
    setError("");

    try {
      const res = await api<{ success: boolean; data: Enquiry }>(
        `/api/enquiries/${current._id}/respond`,
        {
          method: "PATCH",
          auth: true,
          body: {
            status,
            responseMessage: message?.trim() || undefined,
          },
        }
      );
      setCurrent(res.data);
      setModal(null);
      setNote("");
      onChanged?.(res.data);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not respond");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    setError("");

    try {
      const res = await api<{ success: boolean; data: Enquiry }>(
        `/api/enquiries/${current._id}/withdraw`,
        { method: "PATCH", auth: true }
      );
      setCurrent(res.data);
      setModal(null);
      onChanged?.(res.data);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not withdraw enquiry");
    } finally {
      setBusy(false);
    }
  };

  const markSold = async () => {
    if (!listing) return;
    setBusy(true);
    setError("");

    try {
      const res = await api<{ success: boolean; data: Listing }>(
        `/api/listings/${listing._id}/status`,
        { method: "PATCH", auth: true, body: { status: "sold" } }
      );

      setCurrent((item) =>
        typeof item.listing === "string"
          ? item
          : {
              ...item,
              listing: {
                ...item.listing,
                status: res.data.status,
                isActive: res.data.isActive,
              },
            }
      );
      setModal(null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark as sold");
    } finally {
      setBusy(false);
    }
  };

  const modalTitle =
    modal === "accept"
      ? "Accept this offer?"
      : modal === "reject"
        ? "Decline this enquiry?"
        : modal === "withdraw"
          ? "Withdraw your enquiry?"
          : "Mark this item as sold?";

  const modalDescription =
    modal === "accept"
      ? "The item will be reserved for this buyer and all other pending offers on this listing will be declined automatically."
      : modal === "reject"
        ? "Let the buyer know why you can't take this offer. The note is optional but helpful."
        : modal === "withdraw"
          ? "The seller will be notified that you are no longer interested."
          : "This closes the deal. The accepted buyer will be notified that the item is sold.";

  const confirmModal = () => {
    if (modal === "accept") {
      void respond("accepted", note);
    } else if (modal === "reject") {
      void respond("rejected", note);
    } else if (modal === "withdraw") {
      void withdraw();
    } else if (modal === "sold") {
      void markSold();
    }
  };

  return (
    <article className="card overflow-hidden">
      {error ? (
        <div className="p-4 pb-0">
          <Alert message={error} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row">
        {listing ? (
          <Link
            href={`/listings/${listing._id}`}
            className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-20"
          >
            <img
              src={assetUrl(listing.images?.[0])}
              alt={listing.title}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.svg";
              }}
            />
          </Link>
        ) : (
          <div className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 sm:h-20 sm:w-20">
            <Icon name="package" className="h-7 w-7" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            {listing ? (
              <div className="min-w-0">
                <Link
                  href={`/listings/${listing._id}`}
                  className="line-clamp-1 font-bold text-zinc-900 hover:text-indigo-600"
                >
                  {listing.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-700">
                    {formatCurrency(listing.price ?? 0)}
                  </span>
                  <span
                    className={`badge ${statusBadgeClass(listing.status)}`}
                  >
                    {LISTING_STATUS_LABELS[listing.status]}
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-bold text-zinc-900">Listing removed</span>
            )}

            <span className={`badge ${statusBadgeClass(current.status)}`}>
              {ENQUIRY_STATUS_LABELS[current.status]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[9px] font-bold text-indigo-700">
                {person?.name?.charAt(0).toUpperCase() || "S"}
              </span>
              <span>
                <span className="font-semibold text-zinc-600">
                  {personLabel}:
                </span>{" "}
                {person?.name || "Student"}
                {person?.college ? `, ${person.college}` : ""}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" className="h-3.5 w-3.5" />
              {timeAgo(current.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
          {current.message}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400">
            {mode === "received" ? "Received" : "Sent"}{" "}
            {formatDate(current.createdAt)}
          </span>
          {current.offerPrice !== null &&
          current.offerPrice !== undefined ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
              <Icon name="tag" className="h-3 w-3" />
              Offer: {formatCurrency(current.offerPrice)}
            </span>
          ) : null}
        </div>

        {current.responseMessage ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
            <span className="font-semibold text-zinc-800">
              {mode === "received" ? "Your note:" : "Seller note:"}
            </span>{" "}
            {current.responseMessage}
          </div>
        ) : null}

        {accepted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
              <Icon name="check-circle" className="h-4 w-4" />
              {mode === "received"
                ? "Reserved for this buyer"
                : "Your offer was accepted"}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {person?.contact?.phone ? (
                <a
                  href={`tel:${person.contact.phone}`}
                  className="btn btn-small bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                >
                  <Icon name="phone" className="h-3.5 w-3.5" />
                  {person.contact.phone}
                </a>
              ) : null}
              {person?.contact?.email ? (
                <a
                  href={`mailto:${person.contact.email}`}
                  className="btn btn-small bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                >
                  <Icon name="mail" className="h-3.5 w-3.5" />
                  {person.contact.email}
                </a>
              ) : null}
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700">
              <Icon name="lock" className="h-3.5 w-3.5" />
              Contact details are only shared for accepted offers.
            </p>
          </div>
        ) : pending ? (
          <p className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Contact details unlock when this offer is accepted.
          </p>
        ) : null}

        {pending && mode === "received" ? (
          <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
            <button
              type="button"
              className="btn btn-primary btn-small"
              disabled={busy}
              onClick={() => {
                setNote("");
                setModal("accept");
              }}
            >
              <Icon name="check" className="h-3.5 w-3.5" />
              Accept & reserve
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              disabled={busy}
              onClick={() => {
                setNote("");
                setModal("reject");
              }}
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              Decline
            </button>
          </div>
        ) : null}

        {pending && mode === "sent" ? (
          <div className="border-t border-zinc-100 pt-3">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              disabled={busy}
              onClick={() => setModal("withdraw")}
            >
              Withdraw enquiry
            </button>
          </div>
        ) : null}

        {accepted && mode === "received" && listing ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
            {listing.status !== "sold" ? (
              <button
                type="button"
                className="btn btn-primary btn-small"
                disabled={busy}
                onClick={() => setModal("sold")}
              >
                <Icon name="check-circle" className="h-3.5 w-3.5" />
                Mark as sold
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                <Icon name="check-circle" className="h-3.5 w-3.5" />
                Item sold
              </span>
            )}
            <Link
              href={`/listings/${listing._id}`}
              className="btn btn-ghost btn-small"
            >
              View listing
            </Link>
          </div>
        ) : null}
      </div>

      <Modal
        open={modal !== null}
        title={modalTitle}
        description={modalDescription}
        confirmLabel={
          modal === "accept"
            ? "Accept & reserve"
            : modal === "reject"
              ? "Decline enquiry"
              : modal === "withdraw"
                ? "Withdraw"
                : "Mark as sold"
        }
        tone={modal === "accept" || modal === "sold" ? "primary" : "danger"}
        confirming={busy}
        onConfirm={confirmModal}
        onClose={() => {
          if (!busy) {
            setModal(null);
            setNote("");
          }
        }}
      >
        {modal === "accept" ? (
          <div className="space-y-3">
            {listing ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <p className="font-semibold">{listing.title}</p>
                <p className="mt-0.5">
                  This item will stop accepting new enquiries until you reopen
                  it.
                </p>
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="accept-note">
                Note to buyer (optional)
              </label>
              <textarea
                id="accept-note"
                className="input min-h-20"
                placeholder="e.g. Let's meet near the library at 5pm."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        {modal === "reject" ? (
          <div>
            <label className="label" htmlFor="reject-note">
              Note to buyer (optional)
            </label>
            <textarea
              id="reject-note"
              className="input min-h-20"
              placeholder="e.g. Sorry, the price is too low for me."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        ) : null}
      </Modal>
    </article>
  );
}
