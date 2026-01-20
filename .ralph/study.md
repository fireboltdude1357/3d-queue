# Project Architecture

_This document is maintained by Claude across sessions. It provides context about the codebase structure, patterns, and conventions._

**Last Updated:** 2026-01-19
**Project:** 3D Print Queue for Ryan

---

## Overview

A web application where friends can submit 3D files for Tanner to print on his 3D printer. Users upload files, track job status, and Tanner manages the print queue from an admin dashboard.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Full-stack React framework with App Router |
| **TypeScript** | Type safety throughout the codebase |
| **Tailwind CSS** | Utility-first styling |
| **Clerk** | Authentication (sign-up, sign-in, user management) |
| **Convex** | Backend database, file storage, real-time subscriptions |

---

## Directory Structure

```
ryan-3d/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── sign-in/           # Clerk sign-in page
│   │   │   └── [[...sign-in]]/page.tsx
│   │   ├── sign-up/           # Clerk sign-up page
│   │   │   └── [[...sign-up]]/page.tsx
│   │   ├── dashboard/         # Protected user dashboard
│   │   │   ├── page.tsx       # Main dashboard with job list
│   │   │   └── submit/        # Job submission flow
│   │   │       └── page.tsx
│   │   ├── admin/             # Admin-only routes (future)
│   │   ├── api/               # API routes if needed
│   │   ├── layout.tsx         # Root layout with ClerkProvider + ConvexClientProvider
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable React components
│   │   ├── ConvexClientProvider.tsx  # Convex React provider
│   │   ├── UserSync.tsx       # Syncs Clerk user to Convex on mount
│   │   ├── FileUpload.tsx     # 3D file upload with drag-and-drop and progress
│   │   ├── JobSubmissionForm.tsx  # Job submission form with file picker + notes
│   │   └── ...               # Future feature components
│   ├── middleware.ts          # Clerk auth middleware
│   └── lib/                   # Utility functions
├── convex/                    # Convex backend
│   ├── schema.ts             # Database schema (users, printJobs tables)
│   ├── users.ts              # User mutations/queries (syncUser, getUserByClerkId, etc.)
│   ├── jobs.ts               # Print job queries and mutations (createJob, getJobsByUser, etc.)
│   ├── files.ts              # File storage functions (generateUploadUrl, getFileUrl, etc.)
│   └── _generated/           # Auto-generated Convex types
├── public/                    # Static assets
└── ...config files
```

---

## Database Schema (Convex)

### Tables

**printJobs**
- `_id`: Auto-generated Convex ID
- `userId`: string (Clerk user ID)
- `userName`: string (display name for admin view)
- `fileId`: Id<"_storage"> (Convex file storage reference)
- `fileName`: string (original filename)
- `fileType`: string (stl, 3mf, obj, etc.)
- `fileSize`: number (bytes)
- `status`: "pending" | "queued" | "printing" | "completed" | "failed" | "cancelled"
- `notes`: string (optional user notes)
- `adminNotes`: string (optional admin notes)
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

**users** (extending Clerk data)
- `_id`: Auto-generated
- `clerkId`: string (Clerk user ID)
- `email`: string
- `name`: string
- `isAdmin`: boolean
- `createdAt`: number

### Status Flow

```
pending → queued → printing → completed
                ↘         ↘
                  failed   cancelled
```

---

## Supported File Types

| Extension | Format | Notes |
|-----------|--------|-------|
| `.stl` | STereoLithography | Most common, binary or ASCII |
| `.3mf` | 3D Manufacturing Format | XML-based, supports colors/materials |
| `.obj` | Wavefront OBJ | Mesh format, widely supported |
| `.gcode` | G-code | Pre-sliced, printer-ready |

Bambu Lab printers use `.3mf` files with additional metadata.

---

## Key Patterns & Conventions

### Naming
- Components: PascalCase (`JobCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Convex functions: camelCase (`createJob`, `getJobsByUser`)
- Routes: kebab-case (`/print-jobs`)

### Authentication Flow
1. Clerk handles all auth UI and session management
2. `@clerk/nextjs` middleware protects routes
3. Clerk user ID stored in Convex for data association
4. Admin role determined by `isAdmin` flag in Convex users table

### Real-time Updates
- Convex provides automatic real-time subscriptions
- Use `useQuery` hooks for live data
- Job status changes reflect instantly in UI

### File Upload Flow
1. User selects file via drag-and-drop or file picker
2. Client validates file type and size (immediate feedback)
3. Client calls `generateUploadUrl` mutation (server validates again)
4. File uploaded directly to Convex storage via signed URL
5. Storage ID returned and saved with job record
6. Files retrievable via `getFileUrl` query (signed URLs)

### File Validation
- **Allowed types:** `.stl`, `.3mf`, `.obj`, `.gcode`
- **Max size:** 50MB
- **Validation:** Done by file extension (MIME types unreliable for 3D files)
- **Dual validation:** Client-side for UX, server-side for security

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react`, `react-dom` | UI library |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `@clerk/nextjs` | Authentication |
| `convex` | Backend/database |
| `lucide-react` | Icons |

### Future Dependencies (3D Preview)
| Package | Purpose |
|---------|---------|
| `three` | 3D rendering |
| `@react-three/fiber` | React wrapper for Three.js |
| `@react-three/drei` | Useful R3F helpers |

---

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```

---

## Admin Access

The admin (Tanner) will be identified by:
1. A specific Clerk user ID, OR
2. An `isAdmin: true` flag in the Convex users table

Admin capabilities:
- View all print jobs from all users
- Update job status
- Add admin notes
- Cancel jobs

---

## Recent Changes

### 2026-01-19 (chunk-005)
- Created `createJob` mutation in `convex/jobs.ts`
- Created job submission page at `/dashboard/submit`
- `JobSubmissionForm` component integrates `FileUpload` with notes textarea
- Dashboard updated with "Submit Print Job" button and empty state
- Form validation: requires file before submission
- Success flow: shows success message, redirects to dashboard after 1500ms

### 2026-01-19 (chunk-004)
- Created `convex/files.ts` with file storage mutations and validation
- Created `FileUpload.tsx` component with drag-and-drop, progress bar, error states
- File validation: .stl, .3mf, .obj, .gcode allowed (50MB max)
- Server-side validation via `generateUploadUrl` mutation
- `getFileUrl` query for retrieving signed URLs
- `deleteFile` mutation for cleanup

### 2026-01-19 (chunk-003)
- Convex schema fully defined with `users` and `printJobs` tables
- User sync mechanism: `UserSync` component calls `syncUser` mutation on dashboard visit
- User functions: `syncUser`, `getUserByClerkId`, `isUserAdmin`, `setUserAdmin`
- Job queries: `getJobsByUser`, `getAllJobs`, `getJobById`, `getJobsByStatus`
- Schema includes indexes for efficient queries (by_clerk_id, by_user_id, by_status, by_created_at)
- Status enum: pending, queued, printing, completed, failed, cancelled

### 2026-01-19 (chunk-002)
- Clerk authentication integrated with ClerkProvider
- Sign-in and sign-up pages created with Clerk components
- Middleware created to protect non-public routes
- Dashboard page created with user info and sign-out
- Environment variables documented for Clerk

### 2026-01-20 (chunk-001)
- Next.js 16 project initialized with App Router, TypeScript, Tailwind CSS v4
- Convex package installed, schema file created
- ConvexClientProvider created (gracefully handles missing env)
- Landing page created with sign-in/sign-up buttons
- ESLint configured and passing

### 2026-01-20 (Planning Session)
- Initial architecture defined
- Tech stack selected: Next.js + Clerk + Convex
- Database schema designed
- 7 implementation chunks planned

---

## Context for This Feature

This is a personal project for managing 3D print requests from friends. The primary user is Ryan, but the system supports multiple users with invite capability.

The 3D file preview feature is deferred to a future phase - initial release focuses on functional file upload and job tracking.
