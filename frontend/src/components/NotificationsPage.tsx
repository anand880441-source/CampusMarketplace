"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { NotificationItem, NotificationsResponse } from "@/lib/types";
import Alert from "./Alert";
import Icon from "./Icon";
import NotificationList from "./NotificationList";
import Pagination from "./Pagination";

function NotificationSkeleton() {
  return (
    <div className="card flex gap-3 p-4">
      <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-2/5" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUnread, setShowUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "10");
        if (showUnread) params.set("unread", "true");

        const res = await api<NotificationsResponse>(
          `/api/notifications?${params.toString()}`,
          { auth: true }
        );

        if (!active) return;

        const responseTotalPages = res.pagination?.totalPages || 1;
        if (res.data.length === 0 && page > responseTotalPages) {
          setPage(responseTotalPages);
          return;
        }

        setItems(res.data);
        setUnreadCount(res.unreadCount || 0);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
        setTotalPages(responseTotalPages);

        window.dispatchEvent(
          new Event("campusmarket:notifications-changed")
        );
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load notifications"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [page, showUnread, reloadKey]);

  const markRead = async (id: string) => {
    setMarkingId(id);
    setError("");

    try {
      await api(`/api/notifications/${id}/read`, {
        method: "PATCH",
        auth: true,
      });

      if (showUnread) {
        setItems((current) => current.filter((item) => item._id !== id));
        setTotal((current) => Math.max(0, current - 1));
        setReloadKey((key) => key + 1);
      } else {
        setItems((current) =>
          current.map((item) =>
            item._id === id ? { ...item, isRead: true } : item
          )
        );
      }

      setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event("campusmarket:notifications-changed"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not mark notification as read"
      );
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");

    try {
      await api("/api/notifications/read-all", {
        method: "PATCH",
        auth: true,
      });
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("campusmarket:notifications-changed"));

      if (showUnread) {
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not mark notifications as read"
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="container-page max-w-4xl space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Updates</p>
          <h1 className="page-title mt-1">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }.`
              : "You are all caught up."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="btn btn-secondary"
            disabled={loading}
          >
            <Icon
              name="refresh"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={markAllRead}
            className="btn btn-primary"
            disabled={unreadCount === 0 || markingAll}
          >
            <Icon name="check" className="h-4 w-4" />
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              if (showUnread) {
                setShowUnread(false);
                setPage(1);
                setItems([]);
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              !showUnread
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Icon name="bell" className="h-4 w-4" />
            All
          </button>
          <button
            type="button"
            onClick={() => {
              if (!showUnread) {
                setShowUnread(true);
                setPage(1);
                setItems([]);
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
              showUnread
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Icon name="inbox" className="h-4 w-4" />
            Unread
            {unreadCount > 0 ? (
              <span className="rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          {loading
            ? "Refreshing..."
            : `${total} notification${total === 1 ? "" : "s"}`}
        </p>
      </div>

      {error ? <Alert message={error} /> : null}

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      ) : (
        <div className={loading ? "opacity-60" : ""}>
          <NotificationList
            items={items}
            onMarkRead={markRead}
            markingId={markingId}
          />
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
