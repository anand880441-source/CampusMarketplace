import Link from "next/link";
import type { IconName } from "./Icon";
import Icon from "./Icon";
import type { DashboardStats } from "@/lib/types";

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards: {
    label: string;
    value: number;
    hint: string;
    icon: IconName;
    accent: string;
    href: string;
  }[] = [
    {
      label: "Active listings",
      value: stats.active,
      hint: `${stats.reserved} reserved, ${stats.sold} sold`,
      icon: "package",
      accent: "bg-indigo-50 text-indigo-600",
      href: "#my-listings",
    },
    {
      label: "Received enquiries",
      value: stats.receivedEnquiries,
      hint: `${stats.pendingOffers} pending offer${stats.pendingOffers === 1 ? "" : "s"}`,
      icon: "inbox",
      accent: "bg-emerald-50 text-emerald-600",
      href: "/enquiries",
    },
    {
      label: "Sent enquiries",
      value: stats.sentEnquiries,
      hint: "Offers you sent to sellers",
      icon: "send",
      accent: "bg-sky-50 text-sky-600",
      href: "/enquiries",
    },
    {
      label: "Unread notifications",
      value: stats.unreadNotifications,
      hint: "Updates on your activity",
      icon: "bell",
      accent: "bg-amber-50 text-amber-600",
      href: "/notifications",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="card card-hover flex items-start gap-3 p-4"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.accent}`}
          >
            <Icon name={card.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-500">
              {card.label}
            </p>
            <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-zinc-900">
              {card.value}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-400">
              {card.hint}
            </p>
          </div>
          <Icon
            name="chevron-right"
            className="mt-1 h-4 w-4 shrink-0 text-zinc-300"
          />
        </Link>
      ))}
    </div>
  );
}
