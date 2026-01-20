import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Status values for print jobs
export const JOB_STATUSES = [
  "pending",
  "queued",
  "printing",
  "completed",
  "failed",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export default defineSchema({
  // Users table - synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    isAdmin: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // Print jobs table
  printJobs: defineTable({
    userId: v.string(), // Clerk user ID
    userName: v.string(), // Display name for admin view
    fileId: v.id("_storage"), // Convex file storage reference
    fileName: v.string(),
    fileType: v.string(), // stl, 3mf, obj, gcode
    fileSize: v.number(), // bytes
    status: v.union(
      v.literal("pending"),
      v.literal("queued"),
      v.literal("printing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()), // User notes
    adminNotes: v.optional(v.string()), // Admin notes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),
});
