"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, assetUrl } from "@/lib/api";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_OPTIONS,
  LISTING_TYPE_LABELS,
} from "@/lib/constants";
import {
  formatDate,
  formatPrice,
  listingTypeBadgeClass,
  statusBadgeClass,
  timeAgo,
} from "@/lib/format";
import type { Listing, ListingStatus, PublicUser } from "@/lib/types";
import Alert from "./Alert";
import EnquiryForm from "./EnquiryForm";
import FavoriteButton from "./FavoriteButton";
import Icon from "./Icon";
import ListingGrid from "./ListingGrid";
import Modal from "./Modal";
import PageLoader from "./PageLoader";
import SellerCard from "./SellerCard";

export default function ListingDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadListing = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api<{ success: boolean; data: Listing }>(
          `/api/listings/${id}`
        );

        if (!active) return;
        setListing(res.data);
        setSelectedImage(0);

        api<{ success: boolean; data: Listing[] }>(
          `/api/listings/${id}/similar`
        )
          .then((similarRes) => {
            if (active) setSimilar(similarRes.data);
          })
          .catch(() => {
            if (active) setSimilar([]);
          });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load listing");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadListing();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <PageLoader label="Loading listing..." />;
  }

  if (error || !listing) {
    return (
      <div className="container-page space-y-4 py-10">
        <Alert message={error || "Listing not found"} />
        <Link href="/" className="btn btn-primary">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const seller =
    typeof listing.seller === "string"
      ? null
      : (listing.seller as PublicUser);
  const isOwner = Boolean(user && seller && user._id === seller._id);
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ["/placeholder.svg"];
  const canEnquire = listing.isActive && listing.status === "available";

  const enquiryDisabledMessage = !listing.isActive
    ? "This listing is currently paused by the seller."
    : listing.status === "sold"
      ? "This item has already been sold."
      : "This item is reserved for another buyer while they arrange pickup.";

  const updateStatus = async (status: ListingStatus) => {
    setStatusBusy(true);
    setActionError("");

    try {
      const res = await api<{ success: boolean; data: Listing }>(
        `/api/listings/${listing._id}/status`,
        { method: "PATCH", auth: true, body: { status } }
      );
      setListing((current) =>
        current ? { ...res.data, seller: current.seller } : res.data
      );
      return true;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update status"
      );
      return false;
    } finally {
      setStatusBusy(false);
    }
  };

  const handleStatusClick = (status: ListingStatus) => {
    if (status === listing.status) return;

    if (status === "sold") {
      setSoldOpen(true);
      return;
    }

    if (status === "reserved" && listing.status === "available") {
      setReserveOpen(true);
      return;
    }

    void updateStatus(status);
  };

  const handleMarkSold = async () => {
    const ok = await updateStatus("sold");
    if (ok) setSoldOpen(false);
  };

  const handleReserve = async () => {
    const ok = await updateStatus("reserved");
    if (ok) setReserveOpen(false);
  };

  const handleToggleActive = async () => {
    setActionError("");

    try {
      const res = await api<{ success: boolean; data: Listing }>(
        `/api/listings/${listing._id}`,
        {
          method: "PATCH",
          auth: true,
          body: { isActive: !listing.isActive },
        }
      );
      setListing((current) =>
        current ? { ...res.data, seller: current.seller } : res.data
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update listing"
      );
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError("");

    try {
      await api(`/api/listings/${listing._id}`, {
        method: "DELETE",
        auth: true,
      });
      router.push("/dashboard");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete listing"
      );
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="container-page py-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"
      >
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <Icon name="chevron-right" className="h-3 w-3 text-zinc-300" />
        <Link
          href={`/?category=${listing.category}`}
          className="hover:text-indigo-600"
        >
          {CATEGORY_LABELS[listing.category]}
        </Link>
        <Icon name="chevron-right" className="h-3 w-3 text-zinc-300" />
        <span className="max-w-64 truncate font-medium text-zinc-700">
          {listing.title}
        </span>
      </nav>

      <div className="mt-4 space-y-3">
        {actionError ? <Alert message={actionError} /> : null}
        {!listing.isActive ? (
          <Alert
            type="warning"
            message="This listing is currently paused by the seller."
          />
        ) : null}
        {listing.status === "reserved" && listing.isActive ? (
          <Alert
            type="warning"
            message={
              isOwner
                ? "This listing is reserved. Enquiries are paused until you mark it available again."
                : "This item is reserved for a buyer while they arrange pickup. Enquiries are paused."
            }
          />
        ) : null}
        {listing.status === "sold" ? (
          <Alert
            type="info"
            message={
              isOwner
                ? "You marked this item as sold. Buyers can still view the listing."
                : "This item has been sold. Browse similar listings below."
            }
          />
        ) : null}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-zinc-100 sm:aspect-[16/10]">
              <img
                src={assetUrl(images[selectedImage])}
                alt={listing.title}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
              />

              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span
                  className={`badge ${listingTypeBadgeClass(listing.listingType)}`}
                >
                  {LISTING_TYPE_LABELS[listing.listingType]}
                </span>
                <span className={`badge ${statusBadgeClass(listing.status)}`}>
                  {LISTING_STATUS_LABELS[listing.status]}
                </span>
                {!listing.isActive ? (
                  <span className="badge bg-zinc-800 text-white">Paused</span>
                ) : null}
              </div>

              {!isOwner ? (
                <div className="absolute right-3 top-3">
                  <FavoriteButton listingId={listing._id} />
                </div>
              ) : null}

              {images.length > 1 ? (
                <span className="absolute bottom-3 right-3 rounded-full bg-zinc-950/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                  {selectedImage + 1} / {images.length}
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === index
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={assetUrl(image)}
                      alt={`${listing.title} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">{CATEGORY_LABELS[listing.category]}</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
                  {listing.title}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    Posted {timeAgo(listing.createdAt)}
                  </span>
                  <span aria-hidden="true">-</span>
                  <span>{formatDate(listing.createdAt)}</span>
                </p>
              </div>

              <p className="text-3xl font-extrabold tracking-tight text-indigo-600">
                {formatPrice(listing)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-zinc-100 pt-5 sm:grid-cols-4">
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  <Icon name="star" className="h-3 w-3" />
                  Condition
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {CONDITION_LABELS[listing.condition]}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  <Icon name="tag" className="h-3 w-3" />
                  Type
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {LISTING_TYPE_LABELS[listing.listingType]}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  <Icon name="map-pin" className="h-3 w-3" />
                  Location
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-800">
                  {listing.location || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  <Icon name="calendar" className="h-3 w-3" />
                  Listed
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {formatDate(listing.createdAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-zinc-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-600">
              {listing.description}
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {isOwner ? (
            <div className="card overflow-hidden">
              <div className="border-b border-zinc-100 bg-zinc-50/60 p-4">
                <p className="eyebrow">Owner tools</p>
                <h2 className="mt-1 font-bold text-zinc-900">
                  Manage your listing
                </h2>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="label">Listing status</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {LISTING_STATUS_OPTIONS.map((option) => {
                      const active = listing.status === option.value;
                      const activeTone =
                        option.value === "available"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : option.value === "reserved"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-zinc-400 bg-zinc-100 text-zinc-700";

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={statusBusy}
                          onClick={() => handleStatusClick(option.value)}
                          className={`rounded-xl border px-2 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                            active
                              ? activeTone
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] leading-4 text-zinc-400">
                    Reserving declines other pending offers and pauses new
                    enquiries. Sold closes the deal and notifies accepted
                    buyers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/listings/${listing._id}/edit`}
                    className="btn btn-secondary"
                  >
                    <Icon name="edit" className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className="btn btn-secondary"
                  >
                    <Icon name="eye" className="h-3.5 w-3.5" />
                    {listing.isActive ? "Pause" : "Publish"}
                  </button>
                </div>

                <Link href="/enquiries" className="btn btn-secondary w-full">
                  <Icon name="inbox" className="h-4 w-4" />
                  Review buyer enquiries
                </Link>

                {listing.status === "reserved" ? (
                  <button
                    type="button"
                    onClick={() => setSoldOpen(true)}
                    disabled={statusBusy}
                    className="btn btn-primary w-full"
                  >
                    <Icon name="check-circle" className="h-4 w-4" />
                    Mark as sold
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="btn w-full text-red-600 hover:bg-red-50"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Delete listing
                </button>
              </div>
            </div>
          ) : seller ? (
            <SellerCard seller={seller} />
          ) : null}

          {!isOwner && seller ? (
            <EnquiryForm
              listingId={listing._id}
              listingTitle={listing.title}
              disabled={!canEnquire}
              disabledMessage={enquiryDisabledMessage}
            />
          ) : null}

          <div className="card p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Icon name="shield" className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-zinc-900">
                Stay safe on campus
              </h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
              <li className="flex gap-2">
                <Icon
                  name="check-circle"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                />
                Meet in busy campus spots like the library or canteen.
              </li>
              <li className="flex gap-2">
                <Icon
                  name="check-circle"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                />
                Inspect the item carefully before paying.
              </li>
              <li className="flex gap-2">
                <Icon
                  name="check-circle"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                />
                Never share OTPs, bank passwords or card details.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mt-10 space-y-3">
          <div>
            <p className="eyebrow">Keep exploring</p>
            <h2 className="section-title mt-1">Similar listings</h2>
          </div>
          <ListingGrid listings={similar} />
        </section>
      ) : null}

      <Modal
        open={deleteOpen}
        title="Delete this listing?"
        description="This removes the listing and its enquiries permanently. This action cannot be undone."
        confirmLabel="Delete listing"
        tone="danger"
        confirming={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      />

      <Modal
        open={reserveOpen}
        title="Reserve this item?"
        description="Every pending offer on this listing will be declined automatically, and new enquiries will pause until you reopen the listing."
        confirmLabel="Reserve item"
        confirming={statusBusy}
        onConfirm={() => void handleReserve()}
        onClose={() => {
          if (!statusBusy) setReserveOpen(false);
        }}
      />

      <Modal
        open={soldOpen}
        title="Mark this item as sold?"
        description="The listing will be closed and any accepted buyer will be notified that the deal is complete."
        confirmLabel="Mark as sold"
        confirming={statusBusy}
        onConfirm={() => void handleMarkSold()}
        onClose={() => {
          if (!statusBusy) setSoldOpen(false);
        }}
      />
    </div>
  );
}
