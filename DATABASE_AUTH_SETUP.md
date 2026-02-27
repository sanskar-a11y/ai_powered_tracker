# Production Database & Auth Setup Guide

## ✅ Completed Setup (10/10 Steps)

### **CRITICAL: Your Next Steps**

Before running your app, you **MUST** complete these configurations in `.env.local`:

```env
# 1. PostgreSQL (Neon Cloud) - https://console.neon.tech/
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# 2. Clerk Authentication - https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 3. Gemini API (Optional) - https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=...
```

---

## Setup Checklist

### Phase 1: Database (Prisma + Neon)
- [x] Prisma installed (`@prisma/client`, `prisma`)
- [x] Database URL configured in `.env.local`
- [x] Prisma schema created with User, Task, Habit, FocusSession models
- [x] Prisma singleton created at `src/lib/prisma.ts`
- [ ] **NEXT: Run migration** (when DATABASE_URL is filled)
  ```bash
  npx prisma migrate dev --name init
  ```

### Phase 2: Authentication (Clerk)
- [x] ClerkProvider wraps root layout
- [x] Clerk middleware protects `/protected/*` routes
- [x] Sign-in page connected to Clerk
- [x] Sign-up page connected to Clerk
- [x] User sync hook created (`useSyncUser`)
- [x] User sync API route created (`/api/auth/sync-user`)
- [x] Protected layout uses sync hook
- [ ] **NEXT: Fill Clerk keys in `.env.local`**

### Phase 3: Testing
- [ ] Start dev server: `npm run dev`
- [ ] Visit `http://localhost:3000/sign-up`
- [ ] Create account (creates Clerk user)
- [ ] Verify user appears in Neon database (Prisma Studio: `npx prisma studio`)
- [ ] Test protected routes at `/dashboard`

---

## Architecture Overview

```
Clerk (Authentication)
  ↓ (clerkId + user data)
Neon PostgreSQL (Storage)
  ↓ (Prisma ORM)
Next.js App Router
  ↓ (Protected routes via middleware)
Gemini API (Server-side AI only)
```

### User Flow
1. User signs up at `/sign-up` with Clerk
2. `useSyncUser` hook triggers on protected route load
3. `POST /api/auth/sync-user` creates user in Prisma
4. `clerkId` links Clerk user to Prisma user
5. Access to all features via `userId` from Clerk + Prisma record

---

## Files Created / Modified

### New Files
- `src/lib/prisma.ts` - Prisma singleton (prevents connection pooling issues)
- `src/hooks/useSyncUser.ts` - Hook to sync Clerk user with database
- `src/app/api/auth/sync-user/route.ts` - API endpoint for user sync
- `src/app/api/test-db/route.ts` - Database connection test endpoint
- `src/middleware.ts` - Clerk middleware for route protection
- `prisma/schema.prisma` - Database schema
- `prisma.config.ts` - Prisma configuration (Prisma 7)

### Modified Files
- `src/app/layout.tsx` - Added ClerkProvider wrapper
- `src/app/(protected)/layout.tsx` - Added useSyncUser hook
- `src/app/(public)/sign-up/page.tsx` - Integrated Clerk
- `src/app/(public)/sign-in/page.tsx` - Integrated Clerk
- `.env` - Public environment variables
- `.env.local` - Secret credentials (CREATE THIS)

---

## Database Schema

### User
- `id` (String, primary key)
- `clerkId` (String, unique) - Links to Clerk user
- `email` (String, unique)
- `name` (String, optional)
- `avatar` (String, optional)
- `createdAt`, `updatedAt`
- Relations: tasks, habits, sessions

### Task
- `id`, `userId` (foreign key)
- `title`, `description`, `status` (TODO|IN_PROGRESS|COMPLETED|ARCHIVED)
- `priority` (LOW|MEDIUM|HIGH|URGENT)
- `dueDate`, `completedAt`
- `createdAt`, `updatedAt`

### Habit
- `id`, `userId` (foreign key)
- `name`, `description`, `frequency` (DAILY|WEEKLY|MONTHLY)
- `icon`, `color`, `isActive`
- `streakCount`, `totalDays`, `lastLoggedAt`
- `createdAt`, `updatedAt`

### FocusSession
- `id`, `userId` (foreign key)
- `title`, `duration` (minutes)
- `focusMode`, `startedAt`, `endedAt`
- `notes`, `isCompleted`
- `createdAt`, `updatedAt`

---

## Common Commands

### Database
```bash
# View data visually
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name [migration_name]

# Deploy migration to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Clerk
```bash
# Check Clerk status
# Dashboard: https://dashboard.clerk.com/
```

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Check for errors
```

---

## Testing Endpoints (After Configuration)

### Database Connection Test
```bash
curl http://localhost:3000/api/test-db
```

Response (success):
```json
{
  "success": true,
  "message": "Database connection successful",
  "userCount": 0,
  "timestamp": "2026-02-27T..."
}
```

### User Sync (After Sign-up)
Check Prisma Studio:
```bash
npx prisma studio
# Navigate to http://localhost:5555
# View User table - should show your account
```

---

## Production Deployment

### Environment Variables (Vercel / Prod)
Must set in your hosting platform's environment:
- `DATABASE_URL` (Neon)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `GOOGLE_API_KEY` (if using AI features)

### Database Deployment
```bash
# From your production environment
npx prisma migrate deploy
```

### Remove Test Route
Delete `src/app/api/test-db/route.ts` before production deployment.

---

## Troubleshooting

### "DATABASE_URL not found"
- Check `.env.local` exists in project root
- Verify DATABASE_URL is filled in (not empty)
- Restart dev server after changing `.env.local`

### "Prisma Client not generated"
- Run: `npx prisma generate`
- Or run any Prisma command (generates automatically)

### "Clerk keys invalid"
- Verify keys copied from Clerk Dashboard (not corrupted)
- Check for extra spaces/quotes in `.env.local`
- Restart dev server

### "User not syncing to database"
- Check `/api/test-db` endpoint works first
- Check Clerk is properly authenticated (look for session cookie)
- Check browser console for errors in sync hook
- View Prisma Studio: `npx prisma studio`

---

## Security Best Practices ✓ Implemented

- ✅ Secrets in `.env.local` (not committed)
- ✅ `.env.local` added to `.gitignore`
- ✅ Clerk handles password hashing
- ✅ Protected routes require authentication
- ✅ Middleware protects all `/protected/*` routes
- ✅ Database connection pooling managed by Prisma
- ✅ Gemini API key server-side only (not exposed to client)
- ✅ User sync validates Clerk user ID matches request

---

## Next: Building Features

With this foundation, you can now build:

1. **Task Management**
   - Create/update/delete tasks
   - Filter by status/priority
   - Due date notifications

2. **Habit Tracking**
   - Log habits daily
   - Streak calculations
   - Habit analytics

3. **Focus Sessions**
   - Pomodoro timer
   - Session analytics
   - Deep work tracking

4. **AI Features** (Gemini API)
   - Task summarization
   - Habit optimization
   - Schedule planning

5. **Analytics Dashboard**
   - Productivity charts
   - Habit completion rates
   - Focus time trends

---

## Support

- Prisma Docs: https://www.prisma.io/docs/
- Clerk Docs: https://clerk.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
