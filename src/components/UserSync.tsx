"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

interface UserSyncProps {
  clerkId: string;
  email: string;
  name: string;
}

/**
 * Client component that syncs Clerk user data to Convex.
 * Renders nothing - just performs the sync on mount.
 */
export function UserSync({ clerkId, email, name }: UserSyncProps) {
  const syncUser = useMutation(api.users.syncUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per mount
    if (hasSynced.current) return;
    hasSynced.current = true;

    syncUser({ clerkId, email, name }).catch((error) => {
      console.error("Failed to sync user:", error);
    });
  }, [syncUser, clerkId, email, name]);

  return null;
}
