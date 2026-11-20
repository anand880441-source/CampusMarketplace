import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[65vh] flex-col items-center justify-center py-12 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-indigo-100/60 blur-3xl" />
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-xl shadow-indigo-100">
          <Icon name="graduation" className="h-10 w-10" />
        </span>
        <span className="absolute -right-3 -top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-amber-950 shadow-sm">
          404
        </span>
      </div>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
        This page is off campus
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        The page you are looking for may have been moved, or the listing may no
        longer exist. Let&apos;s get you back to something useful.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          <Icon name="search" className="h-4 w-4" />
          Browse marketplace
        </Link>
        <Link href="/dashboard" className="btn btn-secondary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
