You are starting a Ralph planning session. Use extended thinking to deeply analyze this request.

## Feature Overview

**Name:** 3d-queue
**Slug:** 3d-queue

## Detailed Description

I would like to build a web application where users can submit their 3D files for me to print on my 3D printer. The user specifically that I'm targeting is one of my friends. His name is Ryan. I would like to use Next.js. I'd like to use Clerc for user authentication. I'd like to use Convex for the backend database. I'd like it to possibly, for them to be uploading all different types of 3D files. So UF2s, 3MFs, Bamboo files. And if possible, I would like to be able to render that 3D file in a visual renderer in the website and be able to navigate around it and look at it. But that's like a big if

---

## Your Task

You must analyze this feature request and set up the Ralph context files. Take your time to think through this thoroughly.

### Step 1: Understand the Project

First, explore the current directory structure to understand what exists:
- What files and folders are present?
- Is there existing code to build upon?
- What tech stack is being used (or should be used)?

### Step 2: Update .ralph/study.md

Document what you learn about the project:
- Directory structure
- Key files and their purposes
- Patterns and conventions (existing or recommended)
- Dependencies needed

### Step 3: Break Down the Feature into Chunks

Think carefully about how to divide "3d-queue" into discrete, implementable chunks. Each chunk should:
- Be completable in a single focused session (1-2 hours of work)
- Have clear, verifiable acceptance criteria
- Be small enough that context from study.md and progress.md is sufficient
- List dependencies on other chunks if order matters

### Step 4: Update .ralph/prd.md

Replace the placeholder chunks with your actual implementation plan. The JSON between the RALPH:CHUNKS markers must be valid:

```json
{
  "feature": "3d-queue",
  "totalChunks": <number>,
  "completedChunks": 0,
  "chunks": [
    {
      "id": "chunk-001",
      "title": "Descriptive title",
      "completed": false,
      "dependencies": [],
      "acceptanceCriteria": [
        "Specific criterion 1",
        "Specific criterion 2"
      ]
    }
  ]
}
```

Also update the "Overview" and "Notes" sections of the PRD with relevant context.

### Step 5: Ask Clarifying Questions

If anything is unclear or you need more information to create a good plan, ASK ME. Don't guess on important architectural decisions.

---

## Important Rules

1. **Think deeply** - Use extended thinking to reason through the architecture
2. **Be thorough** - A good plan now saves time later
3. **Ask questions** - If requirements are ambiguous, ask before assuming
4. **Stay focused** - Only plan, do NOT start implementing any code
5. **Document everything** - The next session will only have these files for context

When you're done planning, say "Planning complete" and summarize the chunks you've created.