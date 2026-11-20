import type { Listing } from "./types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatPrice(
  listing: Pick<Listing, "price" | "listingType">
) {
  if (listing.listingType === "free") return "Free";
  if (listing.listingType === "exchange") return "Exchange";
  return formatCurrency(listing.price);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(value: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(value).getTime()) / 1000
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(value);
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "available":
    case "accepted":
      return "bg-emerald-100 text-emerald-700";
    case "reserved":
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "sold":
      return "bg-zinc-200 text-zinc-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "withdrawn":
      return "bg-zinc-100 text-zinc-600";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

export function listingTypeBadgeClass(listingType: string) {
  if (listingType === "free") return "bg-emerald-600 text-white";
  if (listingType === "exchange") return "bg-violet-600 text-white";
  return "bg-indigo-600 text-white";
}
