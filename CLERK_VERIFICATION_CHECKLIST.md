# Clerk Setup Verification Checklist

Use this checklist to verify that Clerk authentication is properly configured.

---

## ✅ Phase 1: Installation & Configuration

- [ ] `@clerk/nextjs` installed in `package.json`
- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set in `.env.local`
- [ ] `CLERK_SECRET_KEY` set in `.env.local`
- [ ] `DATABASE_URL` configured for Neon PostgreSQL
- [ ] `npx prisma generate` run successfully
- [ ] `npx prisma migrate deploy` run (or `npx prisma db push`)

---

## ✅ Phase 2: Application Structure

### Root Layout
- [ ] File: `src/app/layout.tsx` exists
- [ ] Imports: `import { ClerkProvider } from '@clerk/nextjs'`
- [ ] ClerkProvider wraps `<html>` element
- [ ] Code example:
  ```tsx
  import { ClerkProvider } from '@clerk/nextjs'
  
  export default function RootLayout({ children }) {
    return (
      <ClerkProvider>
        <html>
          <body>{children}</body>
        </html>
      </ClerkProvider>
    )
  }
  ```

### Middleware Configuration
- [ ] File: `src/middleware.ts` exists
- [ ] Imports: `import { authMiddleware } from '@clerk/nextjs'`
- [ ] `publicRoutes` array includes `/`, `/sign-in`, `/sign-up`
- [ ] `matcher` config includes `/(api|trpc)(.*)`
- [ ] Code example:
  ```typescript
  import { authMiddleware } from '@clerk/nextjs'
  
  export default authMiddleware({
    publicRoutes: ['/', '/sign-in', '/sign-up'],
  })
  ```

### Protected Layout
- [ ] File: `src/app/(protected)/layout.tsx` exists
- [ ] Imports: `import { auth } from '@clerk/nextjs/server'`
- [ ] Component is async (not client component)
- [ ] Checks `auth()` for `userId`
- [ ] Calls `redirect('/sign-in')` if no userId
- [ ] Code example:
  ```typescript
  import { auth } from '@clerk/nextjs/server'
  import { redirect } from 'next/navigation'
  
  export default async function ProtectedLayout({ children }) {
    const { userId } = auth()
    if (!userId) redirect('/sign-in')
    return <>{children}</>
  }
  ```

### Sign-In Page
- [ ] File: `src/app/(public)/sign-in/page.tsx` exists
- [ ] Imports: `import { SignIn } from '@clerk/nextjs'`
- [ ] Component is marked `'use client'`
- [ ] Has `redirectUrl="/dashboard"`
- [ ] Styling configured (appearance prop)

### Sign-Up Page
- [ ] File: `src/app/(public)/sign-up/page.tsx` exists
- [ ] Imports: `import { SignUp } from '@clerk/nextjs'`
- [ ] Component is marked `'use client'`
- [ ] Has `redirectUrl="/dashboard"`
- [ ] Styling configured (appearance prop)

### User Sync API
- [ ] File: `src/app/api/auth/sync-user/route.ts` exists
- [ ] Imports: `import { auth } from '@clerk/nextjs/server'`
- [ ] POST method checks `auth()` for `userId`
- [ ] Validates request body has `clerkId`, `email`
- [ ] Verifies `clerkId === userId` (security check)
- [ ] Uses `prisma.user.upsert()` to create/update user

### User Sync Hook
- [ ] File: `src/hooks/useSyncUser.ts` exists
- [ ] Imports: `import { useUser } from '@clerk/nextjs'`
- [ ] Hook runs `useEffect` after `useUser()` loads
- [ ] Calls `/api/auth/sync-user` endpoint
- [ ] Returns sync status and errors

### Prisma Schema
- [ ] File: `prisma/schema.prisma` exists
- [ ] User model has `clerkId String @unique`
- [ ] User model has relationships to tasks, habits, etc.
- [ ] Primary key is `id String @id @default(cuid())`

---

## ✅ Phase 3: Runtime Testing

### Start Development Server
```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] No TypeScript errors in terminal
- [ ] URL: `http://localhost:3000` is accessible

### Test Public Routes
- [ ] Visit `http://localhost:3000/` — renders homepage ✓
- [ ] Visit `http://localhost:3000/sign-in` — shows Clerk SignIn component ✓
- [ ] Visit `http://localhost:3000/sign-up` — shows Clerk SignUp component ✓
- [ ] Can access without authentication ✓

### Test Protected Route Protection
- [ ] Visit `http://localhost:3000/dashboard` while logged out
- [ ] Redirected to `/sign-in` automatically ✓
- [ ] Page does NOT render (no flash of content) ✓

### Test Clerk Sign-Up Flow
1. Visit `http://localhost:3000/sign-up`
2. Fill in email and password (or use social login)
3. Click "Sign Up"
   - [ ] Form submits without errors
   - [ ] Clerk processes registration
   - [ ] Redirects to `/dashboard` ✓
   - [ ] Dashboard loads successfully ✓

### Test User Creation in Database
1. After sign-up, check Prisma database
   ```bash
   npx prisma studio
   # Or use your database client
   ```
   - [ ] New User record exists in database ✓
   - [ ] `clerkId` matches Clerk user ID ✓
   - [ ] `email` matches sign-up email ✓
   - [ ] `name` and `avatar` are populated (if provided) ✓

### Test Header with User Info
1. After successful sign-in
   - [ ] Header shows user's name ✓
   - [ ] Avatar shows user's initial ✓
   - [ ] "Premium" badge displays ✓

### Test Sign-Out
1. Click "Logout" button in header
   - [ ] Redirects to home page `/` ✓
   - [ ] Session cleared ✓
   - [ ] Trying to access `/dashboard` redirects to `/sign-in` ✓

### Test Sign-In Flow
1. Visit `http://localhost:3000/sign-in`
2. Enter previously created account credentials
   - [ ] Form submits without errors
   - [ ] Clerk validates credentials
   - [ ] Redirects to `/dashboard` ✓
   - [ ] User data already in database (no duplicate) ✓

---

## ✅ Phase 4: Browser DevTools Verification

### Network Tab
1. Sign-in and watch Network tab:
   - [ ] Request to `https://accounts.clerk.dev/...` (Clerk auth)
   - [ ] Request to `http://localhost:3000/api/auth/sync-user` (POST)
   - [ ] Response status: `200 OK` ✓

### Application/Storage Tab
1. Look for cookies:
   - [ ] `__clerk_db_jwt` present (Clerk session)
   - [ ] Secure flag ✓
   - [ ] HttpOnly flag ✓

### Console
- [ ] No errors related to Clerk ✓
- [ ] No warnings about missing API keys ✓

---

## ✅ Phase 5: Database Verification

### Prisma Studio
```bash
npx prisma studio
```

- [ ] Can access `User` table ✓
- [ ] Records created during sign-up visible ✓
- [ ] `clerkId` unique (no duplicates) ✓
- [ ] `email` unique (no duplicates) ✓

### Direct Database Query
```bash
# Using psql or your database client
SELECT id, "clerkId", email, name FROM "User" LIMIT 10;
```

- [ ] User records exist ✓
- [ ] `clerkId` values are valid Clerk IDs ✓
- [ ] `email` values match Clerk account emails ✓

---

## ✅ Phase 6: Protected Pages

### Each Protected Route
For `/dashboard`, `/tasks`, `/habits`, `/analytics`, `/ai`, `/settings`:

- [ ] Accessing without auth redirects to `/sign-in`
- [ ] After sign-in, page loads successfully
- [ ] User data is accessible server-side
- [ ] No auth errors in console

### Example: Dashboard Page
```typescript
import { auth } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId } = auth()
  
  // userId is guaranteed to exist
  // Protected layout already checked
  
  return <div>{/* Page content */}</div>
}
```

- [ ] Can safely use `userId` without null checks ✓
- [ ] Can query Prisma with `userId` ✓

---

## ✅ Phase 7: Error Scenarios

### Test Missing .env Variables
1. Remove `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` from `.env.local`
2. Restart dev server
   - [ ] Error message: "Clerk API key is missing" or similar ✓
   - [ ] Sign-in page shows error ✓

### Test Invalid Database URL
1. Change `DATABASE_URL` to invalid URL
2. Try to trigger sync (sign-up)
   - [ ] `/api/auth/sync-user` returns 500 error ✓
   - [ ] Console shows database error ✓

### Test Unauthenticated API Access
1. Call `/api/auth/sync-user` without session
   ```bash
   curl -X POST http://localhost:3000/api/auth/sync-user \
     -H "Content-Type: application/json" \
     -d '{"clerkId":"test","email":"test@test.com"}'
   ```
   - [ ] Returns `401 Unauthorized` ✓
   - [ ] Does NOT create user in database ✓

---

## 🎯 Success Criteria

Your Clerk setup is **production-ready** when:

✅ All checkboxes above are marked  
✅ Sign-up flow completes: user → Clerk → database  
✅ Sign-in flow completes: credentials → Clerk → dashboard  
✅ Protected routes redirect to `/sign-in` when not authenticated  
✅ User data syncs to Prisma immediately after signup  
✅ Header displays authenticated user's name/avatar  
✅ Sign-out clears session and redirects home  
✅ No console errors or warnings  
✅ Database has user records with correct `clerkId` values  

---

## 🚀 When Fully Verified

1. Commit all changes:
   ```bash
   git add .
   git commit -m "feat: integrate Clerk authentication with Prisma"
   ```

2. Deploy to production (Vercel, Netlify, etc.)

3. Update Clerk Dashboard with production URLs:
   - Dashboard → Instance Settings → URLs
   - Add production domain
   - Update `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN/UP_URL`

4. Set production environment variables on hosting platform

5. Test full flow in production environment

---

## 📞 Troubleshooting

If any step fails:

1. Check `npm run dev` console for errors
2. Review browser DevTools (Console, Network, Application tabs)
3. Check `.env.local` has all required variables
4. Restart dev server: `npm run dev`
5. Clear browser cache + cookies
6. Check [CLERK_IMPLEMENTATION_GUIDE.md](CLERK_IMPLEMENTATION_GUIDE.md) for detailed explanations

---

**Last Updated:** February 27, 2026  
**Status:** Ready for verification
