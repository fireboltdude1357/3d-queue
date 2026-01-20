import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JobSubmissionForm } from "@/components/JobSubmissionForm";

export default async function SubmitJobPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Prepare user data for the form
  const userId = user.id;
  const userName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.emailAddresses[0]?.emailAddress || "User";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Submit Print Job
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              New Print Request
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Upload your 3D file and add any notes for your print job.
            </p>
          </div>

          <JobSubmissionForm userId={userId} userName={userName} />
        </div>
      </main>
    </div>
  );
}
