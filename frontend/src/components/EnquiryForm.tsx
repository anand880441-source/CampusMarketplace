"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, statusBadgeClass, timeAgo } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import Modal from "./Modal";

export default function EnquiryForm({
  listingId,
  listingTitle,
  disabled = false,
  disabledMessage = "This listing is not available for enquiries.",
}: {
  listingId: string;
  listingTitle: string;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const { user, loading } = useAuth();

  const [existing, setExisting] = useState<Enquiry | null>(null);
  const [checking, setChecking] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    let active = true;

    if (!user) {
      setChecking(false);
      setExisting(null);
      return;
    }

    const loadMine = async () => {
      setChecking(true);

      try {
        const res = await api<{ success: boolean; data: Enquiry | null }>(
          `/api/enquiries/mine/${listingId}`,
          { auth: true }
        );

        if (!active) return;
        setExisting(res.data);
        setFormOpen(!res.data);
      } catch {
        if (!active) return;
        setFormOpen(true);
      } finally {
        if (active) setChecking(false);
      }
    };

    void loadMine();

    return () => {
      active = false;
    };
  }, [listingId, user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="card p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon name="message" className="h-5 w-5" />
        </span>
        <h2 className="mt-3 font-bold text-zinc-900">
          Interested in this item?
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Log in to send the seller a message and arrange a campus pickup for
          &quot;{listingTitle}&quot;.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/login" className="btn btn-primary flex-1">
            Log in
          </Link>
          <Link href="/register" className="btn btn-secondary flex-1">
            Join
          </Link>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="card space-y-3 p-5">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-9 w-full" />
      </div>
    );
  }

  const canEnquire = !disabled;
  const canSendNew =
    canEnquire &&
    (!existing ||
      existing.status === "rejected" ||
      existing.status === "withdrawn");
  const accepted = existing?.status === "accepted";
  const seller = existing?.seller;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await api<{ success: boolean; data: Enquiry }>(
        "/api/enquiries",
        {
          method: "POST",
          auth: true,
          body: {
            listingId,
            message,
            offerPrice: offerPrice === "" ? undefined : Number(offerPrice),
          },
        }
      );

      setMessage("");
      setOfferPrice("");
      setSuccess("Your enquiry is on its way. The seller has been notified.");
      setFormOpen(false);

      try {
        const mine = await api<{ success: boolean; data: Enquiry | null }>(
          `/api/enquiries/mine/${listingId}`,
          { auth: true }
        );
        setExisting(mine.data);
      } catch {
        setExisting(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send enquiry");
    } finally {
      setSending(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setActionError("");

    try {
      const res = await api<{ success: boolean; data: Enquiry }>(
        `/api/enquiries/${existing?._id}/withdraw`,
        { method: "PATCH", auth: true }
      );
      setExisting(res.data);
      setWithdrawOpen(false);
      setSuccess("");
      setFormOpen(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not withdraw enquiry"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-4">
      {success ? <Alert type="success" message={success} /> : null}
      {actionError ? <Alert message={actionError} /> : null}

      {existing ? (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-indigo-50/80 to-white p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                Your enquiry
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Sent {timeAgo(existing.createdAt)}
              </p>
            </div>
            <span className={`badge ${statusBadgeClass(existing.status)}`}>
              {ENQUIRY_STATUS_LABELS[existing.status]}
            </span>
          </div>

          <div className="space-y-3 p-4">
            <p className="whitespace-pre-line rounded-xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
              {existing.message}
            </p>

            {existing.offerPrice !== null &&
            existing.offerPrice !== undefined ? (
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm">
                <span className="font-medium text-indigo-700">Your offer</span>
                <span className="font-bold text-indigo-800">
                  {formatCurrency(existing.offerPrice)}
                </span>
              </div>
            ) : null}

            {existing.responseMessage ? (
              <div className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
                <span className="font-semibold text-zinc-700">
                  Seller note:
                </span>{" "}
                {existing.responseMessage}
              </div>
            ) : null}

            {accepted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                  <Icon name="check-circle" className="h-4 w-4" />
                  Offer accepted
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  The item is reserved for you until the seller marks it sold.
                  Message {seller?.name || "the seller"} to arrange pickup.
                </p>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  {seller?.contact?.phone ? (
                    <a
                      href={`tel:${seller.contact.phone}`}
                      className="btn btn-small bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    >
                      <Icon name="phone" className="h-3.5 w-3.5" />
                      {seller.contact.phone}
                    </a>
                  ) : null}
                  {seller?.contact?.email ? (
                    <a
                      href={`mailto:${seller.contact.email}`}
                      className="btn btn-small bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    >
                      <Icon name="mail" className="h-3.5 w-3.5" />
                      Email seller
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {existing.status === "pending" ? (
              <>
                <div className="flex items-start gap-2 text-xs leading-5 text-zinc-500">
                  <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0" />
                  Waiting for the seller to respond. You&apos;ll get a
                  notification as soon as they do.
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(true)}
                  className="btn btn-secondary btn-small"
                >
                  Withdraw enquiry
                </button>
              </>
            ) : null}

            {(existing.status === "rejected" ||
              existing.status === "withdrawn") &&
            canSendNew &&
            !formOpen ? (
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  setFormOpen(true);
                }}
                className="btn btn-primary btn-small"
              >
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Send a new enquiry
              </button>
            ) : null}

            {(existing.status === "rejected" ||
              existing.status === "withdrawn") &&
            !canEnquire ? (
              <p className="text-xs text-zinc-500">{disabledMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {formOpen && canEnquire ? (
        <form onSubmit={handleSubmit} className="card overflow-hidden">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-indigo-50/80 to-white p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Icon name="send" className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-zinc-900">Make an offer</h2>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-zinc-500">
              Ask a question or propose a price. The seller can accept or send
              a note back.
            </p>
          </div>

          <div className="space-y-3 p-4">
            {error ? <Alert message={error} /> : null}

            <div>
              <label className="label" htmlFor="enquiry-message">
                Message
              </label>
              <textarea
                id="enquiry-message"
                className="input min-h-24"
                required
                minLength={2}
                maxLength={1000}
                placeholder="Hi, is this still available? Could I pick it up this week?"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="enquiry-offer">
                Offer price (optional)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
                  Rs
                </span>
                <input
                  id="enquiry-offer"
                  type="number"
                  min="0"
                  className="input pl-9"
                  placeholder="For example: 400"
                  value={offerPrice}
                  onChange={(event) => setOfferPrice(event.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={sending}
            >
              <Icon name="send" className="h-4 w-4" />
              {sending ? "Sending..." : "Send enquiry"}
            </button>

            <p className="flex items-start gap-1.5 text-[11px] leading-4 text-zinc-400">
              <Icon name="lock" className="mt-px h-3.5 w-3.5 shrink-0" />
              Your contact details are only shared with the seller if they
              accept your offer.
            </p>
          </div>
        </form>
      ) : null}

      {!existing && !canEnquire ? (
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
            <Icon name="lock" className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-bold text-zinc-900">Enquiries closed</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            {disabledMessage}
          </p>
        </div>
      ) : null}

      <Modal
        open={withdrawOpen}
        title="Withdraw this enquiry?"
        description="The seller will see that you're no longer interested. You can send a new enquiry later while the listing is still available."
        confirmLabel="Withdraw"
        confirming={withdrawing}
        onConfirm={handleWithdraw}
        onClose={() => {
          if (!withdrawing) setWithdrawOpen(false);
        }}
      />
    </div>
  );
}
