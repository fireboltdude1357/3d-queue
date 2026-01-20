"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";

interface JobDetailProps {
  jobId: Id<"printJobs">;
  currentUserId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function JobDetail({ jobId, currentUserId }: JobDetailProps) {
  const job = useQuery(api.jobs.getJobById, { jobId });
  const fileUrl = useQuery(
    api.files.getFileUrl,
    job?.fileId ? { storageId: job.fileId } : "skip"
  );

  // Loading state
  if (job === undefined) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  // Job not found
  if (job === null) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <svg
          className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Job not found
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          This print job doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Security: user can only see their own jobs
  if (job.userId !== currentUserId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
        <svg
          className="mx-auto h-12 w-12 text-red-400 dark:text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h2 className="mt-4 text-lg font-medium text-red-900 dark:text-red-100">
          Access denied
        </h2>
        <p className="mt-2 text-red-600 dark:text-red-400">
          You don&apos;t have permission to view this job.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <svg
          className="mr-1 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Job header */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {job.fileName}
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {job.fileType.toUpperCase()} file • {formatFileSize(job.fileSize)}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* File download */}
        {fileUrl && (
          <div className="mt-6">
            <a
              href={fileUrl}
              download={job.fileName}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download File
            </a>
          </div>
        )}
      </div>

      {/* Job details */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Details
        </h2>

        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Submitted
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {formatDate(job.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Last Updated
            </dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
              {formatDate(job.updatedAt)}
            </dd>
          </div>

          {job.notes && (
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Your Notes
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                {job.notes}
              </dd>
            </div>
          )}

          {job.adminNotes && (
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Admin Notes
              </dt>
              <dd className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                {job.adminNotes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Status history / timeline could go here in future */}
    </div>
  );
}
