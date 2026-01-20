"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { FileUpload } from "./FileUpload";

type FormState = "idle" | "uploading" | "submitting" | "success" | "error";

interface JobSubmissionFormProps {
  userId: string;
  userName: string;
}

interface UploadedFile {
  storageId: Id<"_storage">;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function JobSubmissionForm({ userId, userName }: JobSubmissionFormProps) {
  const router = useRouter();
  const createJob = useMutation(api.jobs.createJob);

  const [formState, setFormState] = useState<FormState>("idle");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUploadComplete = (result: UploadedFile) => {
    setUploadedFile(result);
    setFormState("idle");
    setErrorMessage(null);
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    setFormState("error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that a file has been uploaded
    if (!uploadedFile) {
      setErrorMessage("Please upload a 3D file before submitting.");
      return;
    }

    setFormState("submitting");
    setErrorMessage(null);

    try {
      await createJob({
        userId,
        userName,
        fileId: uploadedFile.storageId,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.fileSize,
        notes: notes.trim() || undefined,
      });

      setFormState("success");

      // Redirect to dashboard after a brief delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit job";
      setErrorMessage(message);
      setFormState("error");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Success state
  if (formState === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
          Print job submitted!
        </h3>
        <p className="mt-2 text-green-700 dark:text-green-300">
          Your job has been added to the queue. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Section */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          3D File <span className="text-red-500">*</span>
        </label>
        {uploadedFile ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {uploadedFile.fileName}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(uploadedFile.fileSize)} &middot; {uploadedFile.fileType.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Change file
              </button>
            </div>
          </div>
        ) : (
          <FileUpload
            onUploadComplete={handleUploadComplete}
            onError={handleUploadError}
            disabled={formState === "submitting"}
          />
        )}
      </div>

      {/* Notes Section */}
      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions or details about your print..."
          rows={4}
          disabled={formState === "submitting"}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          disabled={formState === "submitting"}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!uploadedFile || formState === "submitting"}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formState === "submitting" ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Print Job"
          )}
        </button>
      </div>
    </form>
  );
}
