import Link from "next/link";
import ListingForm from "@/components/ListingForm";
import Protected from "@/components/Protected";

export default function NewListingPage() {
  return (
    <Protected>
      <div className="container-page max-w-3xl py-8">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to dashboard
        </Link>
        <h1 className="page-title mt-1">Sell an item</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add clear photos and honest details so buyers know exactly what they
          are getting.
        </p>
        <div className="mt-6">
          <ListingForm />
        </div>
      </div>
    </Protected>
  );
}
