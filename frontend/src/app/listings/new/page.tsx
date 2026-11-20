import Link from "next/link";
import Icon from "@/components/Icon";
import ListingForm from "@/components/ListingForm";
import Protected from "@/components/Protected";

export default function NewListingPage() {
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
          <span className="font-medium text-zinc-700">Sell an item</span>
        </nav>

        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Icon name="plus" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="page-title">Sell an item</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Add clear photos and honest details so buyers know exactly what
              they are getting.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ListingForm />
        </div>
      </div>
    </Protected>
  );
}
