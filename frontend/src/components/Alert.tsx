import Icon from "./Icon";
import type { IconName } from "./Icon";

const styles: Record<string, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const icons: Record<string, IconName> = {
  error: "alert-circle",
  success: "check-circle",
  info: "info",
  warning: "alert-circle",
};

export default function Alert({
  type = "error",
  message,
}: {
  type?: "error" | "success" | "info" | "warning";
  message: string;
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-6 ${styles[type]}`}
    >
      <Icon name={icons[type]} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
