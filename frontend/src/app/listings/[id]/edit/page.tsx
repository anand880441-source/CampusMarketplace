import Link from "next/link";
import { Suspense } from "react";
import ListingForm from "@/components/ListingForm";
import PageLoader from "@/components/PageLoader";
import Protected from "@/components/Protected";

export default function EditListingPage({
  params,
}: PageProps<"/listings/[id]/edit">) {
  return (
    <Protected>
      <div className="container-page max-w-3xl py-8">
        <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="page-title mt-1">Edit listing</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Update the details, price or photos of your listing.
        </p>

        <div className="mt-6">
          <Suspense fallback={<PageLoader label="Loading listing..." />}>
            {params.then(({ id }) => (
              <ListingForm listingId={id} />
            ))}
          </Suspense>
        </div>
      </div>
    </Protected>
  );
}
