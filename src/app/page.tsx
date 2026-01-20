import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          3D Print Queue
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Submit your 3D files and track your print jobs. Sign in to get started.
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
