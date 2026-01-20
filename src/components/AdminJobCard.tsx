"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { StatusBadge } from "./StatusBadge";
import { JobStatus, JOB_STATUSES } from "../../convex/schema";

interface AdminJobCardProps {
  job: {
    _id: Id<"printJobs">;
    userId: string;
    userName: string;
    fileId: Id<"_storage">;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: JobStatus;
    notes?: string;
    adminNotes?: string;
    createdAt: number;
    updatedAt: number;
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

export function AdminJobCard({ job }: AdminJobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(job.adminNotes ?? "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const updateStatus = useMutation(api.jobs.updateJobStatus);
  const updateAdminNotes = useMutation(api.jobs.updateAdminNotes);
  const fileUrl = useQuery(api.files.getFileUrl, { storageId: job.fileId });

  const handleStatusChange = async (newStatus: JobStatus) => {
    try {
      await updateStatus({ jobId: job._id, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateAdminNotes({ jobId: job._id, adminNotes });
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Main card content - always visible */}
      <div
        className="cursor-pointer p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: User and file info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {job.userName.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {job.userName}
              </span>
            </div>
            <h3 className="mt-2 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {job.fileName}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {job.fileType.toUpperCase()} • {formatFileSize(job.fileSize)} •{" "}
              {formatDate(job.createdAt)}
            </p>
          </div>

          {/* Right side: Status and expand button */}
          <div className="flex items-center gap-3">
            <StatusBadge status={job.status} />
            <svg
              className={`h-5 w-5 text-zinc-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* User notes preview (if any) */}
        {job.notes && !isExpanded && (
          <p className="mt-2 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">User note:</span> {job.notes}
          </p>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="border-t border-zinc-200 p-4 dark:border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Status changer */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    job.status === status
                      ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950"
                      : "hover:opacity-80"
                  }`}
                >
                  <StatusBadge status={status} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* User notes (read-only) */}
          {job.notes && (
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                User Notes
              </label>
              <p className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {job.notes}
              </p>
            </div>
          )}

          {/* Admin notes (editable) */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this print job..."
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes || adminNotes === (job.adminNotes ?? "")}
              className="mt-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSavingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Download button */}
          {fileUrl && (
            <a
              href={fileUrl}
              download={job.fileName}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg
                className="h-4 w-4"
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
          )}
        </div>
      )}
    </div>
  );
}
