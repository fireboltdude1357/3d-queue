"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminJobCard } from "./AdminJobCard";
import { JobStatus } from "../../convex/schema";

type FilterOption = "all" | JobStatus;

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Jobs" },
  { value: "pending", label: "Pending" },
  { value: "queued", label: "Queued" },
  { value: "printing", label: "Printing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminJobsList() {
  const [filter, setFilter] = useState<FilterOption>("all");

  // Fetch all jobs
  const allJobs = useQuery(api.jobs.getAllJobs);

  // Filter jobs client-side based on selected filter
  const filteredJobs =
    filter === "all"
      ? allJobs
      : allJobs?.filter((job) => job.status === filter);

  // Count jobs by status for filter badges
  const statusCounts = allJobs?.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<JobStatus, number>
  );

  // Loading state
  if (allJobs === undefined) {
    return (
      <div className="space-y-4">
        {/* Filter skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
        {/* Card skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (allJobs.length === 0) {
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No print jobs yet
        </h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          When users submit print jobs, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTER_OPTIONS.map((option) => {
          const count =
            option.value === "all"
              ? allJobs.length
              : statusCounts?.[option.value as JobStatus] || 0;

          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {option.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  filter === option.value
                    ? "bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Jobs list */}
      {filteredJobs && filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <AdminJobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-500 dark:text-zinc-400">
            No jobs with status &quot;{filter}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
