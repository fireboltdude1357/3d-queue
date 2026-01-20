# Feature: 3d-queue

## Overview

A web application for managing 3D print requests. Friends (starting with Ryan) can upload 3D files, submit print jobs, and track their status. Tanner manages the queue from an admin dashboard, updating job statuses as prints progress.

**Target Users:**
- **Primary:** Ryan and other friends who want 3D prints
- **Admin:** Tanner (printer owner/operator)

**Core User Flow:**
1. User signs up/signs in via Clerk
2. User uploads a 3D file (STL, 3MF, OBJ, etc.)
3. User submits a print job with optional notes
4. User tracks job status on their dashboard
5. Admin updates status as job progresses through the queue

**Branch:** `ralph/3d-queue`
**Created:** 2026-01-20T04:57:24.674Z
**Session Limit:** 10

---

## Chunks

<!-- RALPH:CHUNKS:START -->
```json
{
  "feature": "3d-queue",
  "totalChunks": 7,
  "completedChunks": 3,
  "chunks": [
    {
      "id": "chunk-001",
      "title": "Project Setup & Next.js Initialization",
      "completed": true,
      "dependencies": [],
      "acceptanceCriteria": [
        "Next.js 14 app created with App Router and TypeScript",
        "Tailwind CSS configured and working",
        "Convex initialized with `npx convex dev` running successfully",
        "Basic folder structure created (src/app, src/components, convex/)",
        "Landing page renders at localhost:3000",
        "ESLint configured and passing"
      ]
    },
    {
      "id": "chunk-002",
      "title": "Clerk Authentication Integration",
      "completed": true,
      "dependencies": ["chunk-001"],
      "acceptanceCriteria": [
        "@clerk/nextjs installed and configured",
        "ClerkProvider wraps the app in root layout",
        "Sign-in page at /sign-in works",
        "Sign-up page at /sign-up works",
        "Middleware protects /dashboard/* routes",
        "User can sign in and see their name/email",
        "Sign-out functionality works"
      ]
    },
    {
      "id": "chunk-003",
      "title": "Convex Schema & User Sync",
      "completed": true,
      "dependencies": ["chunk-002"],
      "acceptanceCriteria": [
        "Convex schema defined with printJobs and users tables",
        "Status enum includes: pending, queued, printing, completed, failed, cancelled",
        "Clerk webhook or sync creates/updates user in Convex on sign-in",
        "User's Clerk ID properly stored in Convex",
        "isAdmin flag exists on users table",
        "Basic queries work: getUserByClerkId, getJobsByUser"
      ]
    },
    {
      "id": "chunk-004",
      "title": "File Upload Infrastructure",
      "completed": false,
      "dependencies": ["chunk-003"],
      "acceptanceCriteria": [
        "Convex file storage configured",
        "File upload mutation accepts files and returns storage ID",
        "File type validation rejects non-3D files",
        "Accepted types: .stl, .3mf, .obj, .gcode",
        "File size limit enforced (suggest 50MB max)",
        "Upload component shows progress feedback",
        "Uploaded files can be retrieved via signed URL"
      ]
    },
    {
      "id": "chunk-005",
      "title": "Print Job Submission Flow",
      "completed": false,
      "dependencies": ["chunk-004"],
      "acceptanceCriteria": [
        "Job submission form with file picker and notes field",
        "createJob mutation creates job with pending status",
        "Job linked to current user's Clerk ID",
        "File metadata (name, size, type) stored with job",
        "Success message shown after submission",
        "User redirected to dashboard after submit",
        "Form validates required fields before submit"
      ]
    },
    {
      "id": "chunk-006",
      "title": "User Dashboard",
      "completed": false,
      "dependencies": ["chunk-005"],
      "acceptanceCriteria": [
        "Dashboard page at /dashboard shows user's jobs",
        "Jobs display: filename, status, submitted date, notes",
        "Status shown with colored badges (pending=yellow, printing=blue, etc.)",
        "Real-time updates when admin changes status",
        "Empty state shown when no jobs exist",
        "Jobs sorted by date (newest first)",
        "User can click to view job details"
      ]
    },
    {
      "id": "chunk-007",
      "title": "Admin Dashboard & Job Management",
      "completed": false,
      "dependencies": ["chunk-006"],
      "acceptanceCriteria": [
        "Admin page at /admin accessible only to admins",
        "Non-admin users redirected or shown error",
        "Admin sees ALL jobs from ALL users",
        "Jobs show: user name, filename, status, date",
        "Admin can change job status via dropdown/buttons",
        "Admin can add notes to jobs",
        "Admin can download the uploaded file",
        "Filter jobs by status (optional but nice)"
      ]
    }
  ]
}
```
<!-- RALPH:CHUNKS:END -->

---

## Notes

### File Format Details
- **STL**: Most common format, binary or ASCII. Widely supported by all slicers.
- **3MF**: Modern format, supports colors and materials. Bambu Lab's native format.
- **OBJ**: Mesh format with material support. May need conversion.
- **G-code**: Pre-sliced files ready for the printer.

### Status Workflow
```
User submits → pending
Admin reviews → queued (accepted into queue)
Print starts → printing
Print finishes → completed
OR
Print fails → failed
User/Admin cancels → cancelled
```

### Future Enhancements (Not in MVP)
- 3D file preview using Three.js/React Three Fiber
- Email notifications when job status changes
- Estimated print time calculation
- Print cost estimation
- Multiple printer support

### Technical Decisions
- Using Convex over traditional DB for built-in real-time and file storage
- Clerk chosen for auth simplicity (no need to build auth from scratch)
- App Router chosen over Pages Router for modern Next.js patterns
- Admin identified by `isAdmin` flag rather than separate role system (KISS)

### Environment Setup Required
Before starting chunk-001, the developer needs:
1. A Clerk account and application (free tier works)
2. A Convex account (free tier works)
3. Node.js 18+ installed

### Styling Approach
- Tailwind CSS for utility-first styling
- Consider shadcn/ui components for consistency (optional)
- Mobile-responsive design (friends might check status on phone)
