import Link from "next/link";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200/80 bg-white/80">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Icon name="graduation" className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-zinc-900">
              Campus<span className="text-indigo-600">Market</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-500">
            A friendly second-hand marketplace built for students. Give useful
            things a second life and save money along the way.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900">Marketplace</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500">
            <li>
              <Link href="/" className="hover:text-indigo-600">
                Browse listings
              </Link>
            </li>
            <li>
              <Link href="/listings/new" className="hover:text-indigo-600">
                Sell an item
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-indigo-600">
                Saved items
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500">
            <li>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/enquiries" className="hover:text-indigo-600">
                Offers and enquiries
              </Link>
            </li>
            <li>
              <Link href="/notifications" className="hover:text-indigo-600">
                Notifications
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900">Stay safe on campus</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Meet in public campus spaces, inspect items before paying and never
            share bank passwords or OTPs.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Built for student safety
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-zinc-400 sm:flex-row">
          <p>CampusMarket - student second-hand marketplace project.</p>
          <p>Made for students, by students.</p>
        </div>
      </div>
    </footer>
  );
}
