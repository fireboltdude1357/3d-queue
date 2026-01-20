"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobCard } from "./JobCard";
import Link from "next/link";

interface JobsListProps {
  userId: string;
}

export function JobsList({ userId }: JobsListProps) {
  const jobs = useQuery(api.jobs.getJobsByUser, { userId });

  // Loading state
  if (jobs === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/5 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4">
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No print jobs yet
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Submit your first print job to get started!
        </p>
        <Link
          href="/dashboard/submit"
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Submit a print job
          <svg
            className="ml-1 h-4 w-4"
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
        </Link>
      </div>
    );
  }

  // Jobs list
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
}
