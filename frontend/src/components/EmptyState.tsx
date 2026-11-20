import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "./Icon";

export default function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
  icon = "package",
  children,
}: {
  title: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      {message ? (
        <p className="max-w-md text-sm leading-6 text-zinc-500">{message}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary mt-2">
          {actionLabel}
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      ) : null}
      {children}
    </div>
  );
}
