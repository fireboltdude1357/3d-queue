import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all print jobs for a specific user.
 * Returns jobs sorted by creation date (newest first).
 */
export const getJobsByUser = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return jobs;
  },
});

/**
 * Get all print jobs (for admin view).
 * Returns jobs sorted by creation date (newest first).
 */
export const getAllJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("printJobs")
      .order("desc")
      .collect();

    return jobs;
  },
});

/**
 * Get a single job by ID.
 */
export const getJobById = query({
  args: {
    jobId: v.id("printJobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Get jobs filtered by status.
 * Useful for admin filtering.
 */
export const getJobsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("queued"),
      v.literal("printing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    return jobs;
  },
});
