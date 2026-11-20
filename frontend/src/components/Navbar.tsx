"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { NotificationsResponse } from "@/lib/types";
import Icon from "./Icon";
import type { IconName } from "./Icon";

const allLinks: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Browse", icon: "search" },
  { href: "/enquiries", label: "Offers", icon: "inbox" },
  { href: "/favorites", label: "Saved", icon: "heart" },
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
];

const publicLinks = allLinks.slice(0, 1);

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? allLinks : publicLinks;

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnread(0);
      return;
    }

    try {
      const res = await api<NotificationsResponse>(
        "/api/notifications?unread=true&limit=1",
        { auth: true }
      );
      setUnread(res.unreadCount || 0);
    } catch {
      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  useEffect(() => {
    const handleChange = () => {
      void refreshUnread();
    };

    window.addEventListener("campusmarket:notifications-changed", handleChange);
    return () =>
      window.removeEventListener(
        "campusmarket:notifications-changed",
        handleChange
      );
  }, [refreshUnread]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  const linkClass = (href: string) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive(href)
        ? "bg-indigo-50 text-indigo-700"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/25">
            <Icon name="graduation" className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900">
            Campus<span className="text-indigo-600">Market</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              <Icon name={link.icon} className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {loading ? (
            <span className="skeleton h-9 w-28" />
          ) : user ? (
            <>
              <Link href="/listings/new" className="btn btn-primary btn-small">
                <Icon name="plus" className="h-4 w-4" />
                <span className="hidden sm:inline">Sell</span>
              </Link>

              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
              >
                <Icon name="bell" className="h-5 w-5" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>

              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl px-1.5 py-1.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate lg:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="hidden h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 lg:flex"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 md:hidden"
              >
                <Icon name={menuOpen ? "x" : "menu"} className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-small">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-small">
                Join free
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-zinc-100 bg-white md:hidden">
          <div className="container-page space-y-3 py-3">
            <nav className="grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  <Icon name={link.icon} className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {user ? (
              <div className="flex items-center gap-2 border-t border-zinc-100 pt-3">
                <Link
                  href="/profile"
                  className="flex flex-1 items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-small"
                >
                  <Icon name="logout" className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
