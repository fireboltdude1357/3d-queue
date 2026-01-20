import { query, mutation } from "./_generated/server";
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

/**
 * Create a new print job.
 * Creates the job with "pending" status.
 */
export const createJob = mutation({
  args: {
    userId: v.string(), // Clerk user ID
    userName: v.string(), // Display name for admin view
    fileId: v.id("_storage"), // Convex file storage reference
    fileName: v.string(),
    fileType: v.string(), // stl, 3mf, obj, gcode
    fileSize: v.number(), // bytes
    notes: v.optional(v.string()), // User notes
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const jobId = await ctx.db.insert("printJobs", {
      userId: args.userId,
      userName: args.userName,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      status: "pending",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

/**
 * Update a job's status.
 * Admin-only mutation for changing job status through the workflow.
 */
export const updateJobStatus = mutation({
  args: {
    jobId: v.id("printJobs"),
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
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.jobId;
  },
});

/**
 * Update a job's admin notes.
 * Admin-only mutation for adding/editing notes on a job.
 */
export const updateAdminNotes = mutation({
  args: {
    jobId: v.id("printJobs"),
    adminNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      adminNotes: args.adminNotes,
      updatedAt: Date.now(),
    });

    return args.jobId;
  },
});
