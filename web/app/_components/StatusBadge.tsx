"use client";

type Status = "pending" | "running" | "done" | "error";

const styles: Record<Status, string> = {
  pending: "bg-gray-700 text-gray-300",
  running: "bg-yellow-500/20 text-yellow-300 animate-pulse",
  done: "bg-green-500/20 text-green-300",
  error: "bg-red-500/20 text-red-300",
};

export default function StatusBadge({ status }: { status: string }) {
  const key = (status?.toLowerCase() ?? "pending") as Status;
  const cls = styles[key] ?? styles.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status || "pending"}
    </span>
  );
}
