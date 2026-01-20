import { JobStatus } from "../../convex/schema";

interface StatusBadgeProps {
  status: JobStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  JobStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: "Pending",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-300",
  },
  queued: {
    label: "Queued",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-300",
  },
  printing: {
    label: "Printing",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-300",
  },
  failed: {
    label: "Failed",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300",
  },
  cancelled: {
    label: "Cancelled",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    textColor: "text-zinc-600 dark:text-zinc-400",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
