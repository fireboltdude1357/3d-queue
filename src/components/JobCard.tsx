import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { JobStatus } from "../../convex/schema";
import { Id } from "../../convex/_generated/dataModel";

interface JobCardProps {
  job: {
    _id: Id<"printJobs">;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: JobStatus;
    notes?: string;
    createdAt: number;
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFileIcon(fileType: string): React.ReactNode {
  return (
    <svg
      className="h-8 w-8 text-zinc-400 dark:text-zinc-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/dashboard/jobs/${job._id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="flex items-start gap-4">
        {/* File icon */}
        <div className="flex-shrink-0">{getFileIcon(job.fileType)}</div>

        {/* Job info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                {job.fileName}
              </h3>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {job.fileType.toUpperCase()} • {formatFileSize(job.fileSize)}
              </p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          {/* Notes preview */}
          {job.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {job.notes}
            </p>
          )}

          {/* Date */}
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Submitted {formatDate(job.createdAt)}
          </p>
        </div>

        {/* Arrow indicator */}
        <svg
          className="h-5 w-5 flex-shrink-0 text-zinc-400 dark:text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
