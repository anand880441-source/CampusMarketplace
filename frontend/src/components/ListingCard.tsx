"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { assetUrl } from "@/lib/api";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  LISTING_STATUS_LABELS,
  LISTING_TYPE_LABELS,
} from "@/lib/constants";
import {
  formatPrice,
  listingTypeBadgeClass,
  statusBadgeClass,
  timeAgo,
} from "@/lib/format";
import type { Listing } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";
import Icon from "./Icon";

export default function ListingCard({ listing }: { listing: Listing }) {
  const { user } = useAuth();

  const seller = typeof listing.seller === "string" ? null : listing.seller;
  const sellerId = seller?._id;
  const isOwn = Boolean(user && sellerId && user._id === sellerId);

  return (
    <article className="card card-hover group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <Link href={`/listings/${listing._id}`} className="block h-full w-full">
          <img
            src={assetUrl(listing.images?.[0])}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span className={`badge ${listingTypeBadgeClass(listing.listingType)}`}>
              {LISTING_TYPE_LABELS[listing.listingType]}
            </span>
            <span className={`badge ${statusBadgeClass(listing.status)}`}>
              {LISTING_STATUS_LABELS[listing.status]}
            </span>
            {!listing.isActive ? (
              <span className="badge bg-zinc-800 text-white">Paused</span>
            ) : null}
          </div>

          {!isOwn ? (
            <FavoriteButton listingId={listing._id} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
          {CATEGORY_LABELS[listing.category]}
          <span className="mx-1.5 text-zinc-300">/</span>
          <span className="text-zinc-500">
            {CONDITION_LABELS[listing.condition]}
          </span>
        </p>

        <Link href={`/listings/${listing._id}`} className="mt-1">
          <h3 className="line-clamp-2 text-base font-bold leading-6 text-zinc-900 transition-colors group-hover:text-indigo-700">
            {listing.title}
          </h3>
        </Link>

        <p className="mt-2 text-lg font-extrabold tracking-tight text-zinc-900">
          {formatPrice(listing)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          {listing.location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
            {timeAgo(listing.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">
              {seller?.name?.charAt(0).toUpperCase() || "S"}
            </span>
            <span className="truncate text-xs font-medium text-zinc-500">
              {seller?.name || "Student seller"}
            </span>
          </div>
          <Icon
            name="arrow-right"
            className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-600"
          />
        </div>
      </div>
    </article>
  );
}
