export default function PageLoader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-sm font-medium text-zinc-500">
      <span className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-zinc-200" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-600" />
        <span className="h-2 w-2 rounded-full bg-indigo-600" />
      </span>
      <span>{label}</span>
    </div>
  );
}
