import Link from "next/link";
import { assetUrl } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { PublicUser } from "@/lib/types";
import Icon from "./Icon";

export default function SellerCard({ seller }: { seller: PublicUser }) {
  return (
    <aside className="card overflow-hidden">
      <div className="border-b border-zinc-100 bg-gradient-to-r from-indigo-50/80 to-white p-4">
        <div className="flex items-center gap-3">
          {seller.profileImage ? (
            <img
              src={assetUrl(seller.profileImage)}
              alt={seller.name}
              className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.svg";
              }}
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-lg font-bold text-indigo-700 shadow-sm">
              {seller.name.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="min-w-0">
            <Link
              href={`/sellers/${seller._id}`}
              className="font-bold text-zinc-900 hover:text-indigo-600"
            >
              {seller.name}
            </Link>
            <p className="truncate text-xs text-zinc-500">
              {seller.college || "Student seller"}
              {seller.course ? ` - ${seller.course}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {seller.memberSince ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              Joined {formatDate(seller.memberSince)}
            </span>
          ) : null}
          {seller.contactPreference ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 px-2.5 py-1">
              <Icon
                name={seller.contactPreference === "phone" ? "phone" : "mail"}
                className="h-3.5 w-3.5"
              />
              Prefers {seller.contactPreference === "phone" ? "phone" : "email"}
            </span>
          ) : null}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500">
          <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          Contact details unlock once the seller accepts your offer. No phone
          numbers or emails are shared publicly.
        </div>

        <Link
          href={`/sellers/${seller._id}`}
          className="btn btn-secondary w-full"
        >
          View seller profile
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
