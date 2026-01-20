"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminJobsList } from "./AdminJobsList";
import Link from "next/link";

interface AdminContentProps {
  clerkId: string;
}

export function AdminContent({ clerkId }: AdminContentProps) {
  const isAdmin = useQuery(api.users.isUserAdmin, { clerkId });

  // Loading state
  if (isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
      </div>
    );
  }

  // Not an admin - show access denied
  if (!isAdmin) {
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
          Access Denied
        </h2>
        <p className="mt-2 text-red-600 dark:text-red-400">
          You don&apos;t have permission to access the admin dashboard.
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

  // User is admin - show the job list
  return <AdminJobsList />;
}
