import Link from "next/link";
import { formatDate, timeAgo } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import type { IconName } from "./Icon";

const typeConfig: Record<
  NotificationItem["type"],
  { icon: IconName; tone: string; label: string }
> = {
  enquiry_received: {
    icon: "inbox",
    tone: "bg-indigo-50 text-indigo-600",
    label: "New enquiry",
  },
  enquiry_response: {
    icon: "message",
    tone: "bg-emerald-50 text-emerald-600",
    label: "Seller response",
  },
  listing_sold: {
    icon: "tag",
    tone: "bg-amber-50 text-amber-600",
    label: "Listing sold",
  },
};

export default function NotificationList({
  items,
  onMarkRead,
  markingId,
}: {
  items: NotificationItem[];
  onMarkRead: (id: string) => void;
  markingId: string | null;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="bell"
        title="No notifications yet"
        message="Enquiries, seller responses and sold-listing updates will show up here."
        actionHref="/"
        actionLabel="Browse the marketplace"
      />
    );
  }

  const today = new Date().toDateString();
  const todayItems = items.filter(
    (item) => new Date(item.createdAt).toDateString() === today
  );
  const earlierItems = items.filter(
    (item) => new Date(item.createdAt).toDateString() !== today
  );

  const sections = [
    { label: "Today", items: todayItems },
    { label: "Earlier", items: earlierItems },
  ].filter((section) => section.items.length > 0);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.label} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            {section.label}
          </h2>

          <div className="space-y-2">
            {section.items.map((notification) => {
              const listing =
                notification.listing &&
                typeof notification.listing === "object"
                  ? notification.listing
                  : null;
              const config =
                typeConfig[notification.type] || typeConfig.enquiry_received;

              return (
                <article
                  key={notification._id}
                  className={`card flex items-start gap-3 p-4 transition-colors ${
                    notification.isRead
                      ? ""
                      : "border-indigo-200 bg-indigo-50/40"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.tone}`}
                  >
                    <Icon name={config.icon} className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        {config.label}
                      </span>
                      {!notification.isRead ? (
                        <span className="badge bg-indigo-600 px-1.5 py-0.5 text-[9px] text-white">
                          New
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`mt-1 text-sm leading-6 ${
                        notification.isRead
                          ? "text-zinc-600"
                          : "font-semibold text-zinc-900"
                      }`}
                    >
                      {notification.message}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                      <span>{timeAgo(notification.createdAt)}</span>
                      <span aria-hidden="true">-</span>
                      <span>{formatDate(notification.createdAt)}</span>
                      {listing ? (
                        <>
                          <span aria-hidden="true">-</span>
                          <Link
                            href={`/listings/${listing._id}`}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                          >
                            View listing
                            <Icon name="arrow-right" className="h-3 w-3" />
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {!notification.isRead ? (
                    <button
                      type="button"
                      title="Mark as read"
                      aria-label="Mark notification as read"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white hover:text-indigo-600"
                      disabled={markingId === notification._id}
                      onClick={() => onMarkRead(notification._id)}
                    >
                      {markingId === notification._id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
                      ) : (
                        <Icon name="check" className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
