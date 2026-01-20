import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { JobDetail } from "@/components/JobDetail";

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            3D Print Queue
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <JobDetail
          jobId={id as Id<"printJobs">}
          currentUserId={user.id}
        />
      </main>
    </div>
  );
}
