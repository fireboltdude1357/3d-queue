import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// File validation constants
export const ALLOWED_FILE_TYPES = [".stl", ".3mf", ".obj", ".gcode"] as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// MIME types that correspond to 3D file formats
// Note: Some 3D files may come as application/octet-stream
export const ALLOWED_MIME_TYPES = [
  "application/octet-stream", // Generic binary (common for .stl, .3mf)
  "model/stl",
  "application/sla", // Alternative STL MIME
  "model/3mf",
  "application/vnd.ms-package.3dmanufacturing-3dmodel+xml", // Official 3MF MIME
  "model/obj",
  "text/plain", // ASCII STL or G-code files
  "application/x-gcode",
] as const;

/**
 * Generate a signed upload URL for file storage.
 * The client will use this URL to upload the file directly to Convex storage.
 *
 * Validates file metadata before generating the URL:
 * - File extension must be .stl, .3mf, .obj, or .gcode
 * - File size must be <= 50MB
 */
export const generateUploadUrl = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { fileName, fileSize } = args;

    // Server-side validation
    const validation = validateFile(fileName, fileSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a signed URL to download/view a file from storage.
 * Returns null if the file doesn't exist.
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage.
 * Useful when a job is cancelled or file needs to be replaced.
 */
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});

/**
 * Validate a file before upload (called from client for early validation).
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateFile(
  fileName: string,
  fileSize: number
): { valid: true } | { valid: false; error: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  // Check file extension
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  if (!ALLOWED_FILE_TYPES.includes(extension as (typeof ALLOWED_FILE_TYPES)[number])) {
    return {
      valid: false,
      error: `Invalid file type "${extension}". Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Get file extension from filename.
 */
export function getFileExtension(fileName: string): string {
  return fileName.toLowerCase().slice(fileName.lastIndexOf(".") + 1);
}
