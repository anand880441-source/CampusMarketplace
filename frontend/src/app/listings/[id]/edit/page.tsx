import Link from "next/link";
import { Suspense } from "react";
import Icon from "@/components/Icon";
import ListingForm from "@/components/ListingForm";
import PageLoader from "@/components/PageLoader";
import Protected from "@/components/Protected";

export default function EditListingPage({
  params,
}: PageProps<"/listings/[id]/edit">) {
  return (
    <Protected>
      <div className="container-page max-w-3xl py-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-500"
        >
          <Link href="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <Icon name="chevron-right" className="h-3 w-3 text-zinc-300" />
          <span className="font-medium text-zinc-700">Edit listing</span>
        </nav>

        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Icon name="edit" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="page-title">Edit listing</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Update the details, price or photos of your listing.
            </p>
          </div>
        </div>

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
