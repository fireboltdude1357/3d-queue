import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sync a user from Clerk to Convex.
 * Creates the user if they don't exist, updates if they do.
 * Called from the dashboard when a user signs in.
 */
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, name } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      // Update existing user (email/name might have changed)
      await ctx.db.patch(existingUser._id, {
        email,
        name,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      isAdmin: false, // New users are not admins by default
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Get a user by their Clerk ID.
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

/**
 * Get the current user's admin status by Clerk ID.
 * Useful for checking if the current user can access admin features.
 */
export const isUserAdmin = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user?.isAdmin ?? false;
  },
});

/**
 * Set a user's admin status.
 * This should only be called by existing admins or during initial setup.
 */
export const setUserAdmin = mutation({
  args: {
    clerkId: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isAdmin: args.isAdmin,
    });

    return user._id;
  },
});
