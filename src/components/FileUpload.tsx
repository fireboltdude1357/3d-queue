"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// File validation constants (mirrored from convex/files.ts for client-side validation)
const ALLOWED_FILE_TYPES = [".stl", ".3mf", ".obj", ".gcode"] as const;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

type UploadState = "idle" | "validating" | "uploading" | "success" | "error";

interface FileUploadProps {
  onUploadComplete: (result: {
    storageId: Id<"_storage">;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onUploadComplete, onError, disabled }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const validateFile = useCallback((file: File): { valid: true } | { valid: false; error: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return {
        valid: false,
        error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
      };
    }

    // Check file extension
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_FILE_TYPES.includes(extension as (typeof ALLOWED_FILE_TYPES)[number])) {
      return {
        valid: false,
        error: `Invalid file type "${extension}". Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
      };
    }

    return { valid: true };
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setErrorMessage(null);
    setUploadState("validating");

    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setUploadState("error");
      onError?.(validation.error);
      return;
    }

    setUploadState("uploading");
    setProgress(0);

    try {
      // Get the upload URL from Convex (with server-side validation)
      const uploadUrl = await generateUploadUrl({
        fileName: file.name,
        fileSize: file.size,
      });

      // Upload the file with progress tracking using XMLHttpRequest
      const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.storageId as Id<"_storage">);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed due to network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload was cancelled"));
        });

        xhr.open("POST", uploadUrl);
        xhr.send(file);
      });

      setUploadState("success");
      setProgress(100);

      // Get file extension for fileType
      const fileType = file.name.toLowerCase().slice(file.name.lastIndexOf(".") + 1);

      onUploadComplete({
        storageId,
        fileName: file.name,
        fileSize: file.size,
        fileType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setErrorMessage(message);
      setUploadState("error");
      onError?.(message);
    }
  }, [generateUploadUrl, onUploadComplete, onError, validateFile]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const resetUpload = useCallback(() => {
    setUploadState("idle");
    setProgress(0);
    setErrorMessage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploadState === "uploading"}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${uploadState === "error" ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950" : ""}
          ${uploadState === "success" ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950" : ""}
        `}
      >
        {/* Idle state */}
        {uploadState === "idle" && (
          <>
            <div className="mb-2">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">
              Drop your 3D file here, or click to browse
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Supports: {ALLOWED_FILE_TYPES.join(", ")} (max 50MB)
            </p>
          </>
        )}

        {/* Validating state */}
        {uploadState === "validating" && (
          <div className="text-gray-600">
            <p className="font-medium">Validating file...</p>
          </div>
        )}

        {/* Uploading state */}
        {uploadState === "uploading" && (
          <div className="space-y-3">
            <p className="text-gray-700 font-medium">
              Uploading {selectedFile?.name}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm">{progress}% complete</p>
          </div>
        )}

        {/* Success state */}
        {uploadState === "success" && selectedFile && (
          <div className="space-y-2">
            <div className="text-green-600">
              <svg
                className="mx-auto h-10 w-10"
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
            <p className="text-green-700 font-medium">Upload complete!</p>
            <p className="text-gray-600 text-sm">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Upload a different file
            </button>
          </div>
        )}

        {/* Error state */}
        {uploadState === "error" && (
          <div className="space-y-2">
            <div className="text-red-600">
              <svg
                className="mx-auto h-10 w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-700 font-medium">Upload failed</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
