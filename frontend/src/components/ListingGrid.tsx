import type { Listing } from "@/lib/types";
import EmptyState from "./EmptyState";
import ListingCard from "./ListingCard";

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] w-full animate-pulse bg-zinc-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  );
}

export default function ListingGrid({
  listings,
  loading = false,
  emptyTitle = "No listings found",
  emptyMessage = "Try changing your search or filters, or check back later.",
}: {
  listings: Listing[];
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
}
