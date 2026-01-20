import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserSync } from "@/components/UserSync";
import { AdminContent } from "@/components/AdminContent";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Prepare user data for syncing to Convex
  const clerkId = user.id;
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.emailAddresses[0]?.emailAddress || "User";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sync user to Convex on page visit */}
      <UserSync clerkId={clerkId} email={email} name={name} />

      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
              {user.emailAddresses[0]?.emailAddress && user.firstName && (
                <span className="ml-2 hidden sm:inline">
                  ({user.emailAddresses[0].emailAddress})
                </span>
              )}
            </div>
            <SignOutButton>
              <button className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin content with access control check */}
        <AdminContent clerkId={clerkId} />
      </main>
    </div>
  );
}
