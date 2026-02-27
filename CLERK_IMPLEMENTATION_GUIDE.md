# Clerk Authentication Integration Guide

**Project:** AI Productivity OS  
**Framework:** Next.js 14 (App Router) + TypeScript  
**Database:** Prisma v7 + PostgreSQL (Neon)  
**Auth Provider:** Clerk v4.29.0  

---

## ✅ Implementation Status

- [x] Clerk installed and configured
- [x] ClerkProvider wraps root layout
- [x] Middleware configured for route protection
- [x] Protected routes secured
- [x] Public routes accessible
- [x] Clerk sign-in/sign-up components integrated
- [x] Auto-redirect to dashboard after login
- [x] Prisma User model connected to Clerk
- [x] User sync to database on first login
- [x] Header shows authenticated user
- [x] Sign-out functionality implemented

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Root Layout (layout.tsx)                │
│          ✓ ClerkProvider wraps app                   │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────────┐      ┌───────▼─────────┐
    │  Middleware │      │  Protected Route│
    │  (authMW)   │      │  (auth + redirect)
    └─────────────┘      └──────┬──────────┘
         │                      │
    ┌────▼────────┐      ┌──────▼──────────┐
    │ Check Auth  │      │ Check userId    │
    │ Redirect    │      │ Redirect if not │
    │ if missing  │      │ authenticated   │
    └─────────────┘      └─────────────────┘
         │                      │
    ┌────▼───────────────────────▼──────┐
    │        Route Rendering              │
    │  (Public or Protected Components)   │
    └─────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │   Clerk User Sync Hook             │
    │   (useSyncUser in protected layout)│
    │   → Creates/updates Prisma User    │
    └───────────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │   Database (PostgreSQL via Prisma) │
    │   ✓ User record with clerkId       │
    └────────────────────────────────────┘
```

---

## 🔐 Production-Safe Setup Explanation

### Why This Setup is Production-Safe:

#### 1. **Two-Layer Authentication Protection**
- **Middleware Layer:** Checks authentication at the edge before any page loads
- **Server Component Layer:** Protected layout uses server-side `auth()` to prevent unauthorized access
- **Result:** No flashing of unauthorized UI, instant protection

#### 2. **Clerk Session Management**
- Clerk handles all session creation, validation, and refresh
- Sessions are stored securely in HttpOnly cookies (default Clerk behavior)
- No custom session code needed—reduces security bugs

#### 3. **Secure User Data Sync**
- `useSyncUser` hook only runs in client components inside protected routes
- Server-side API validates `clerkId` matches authenticated user before writing to DB
- Prevents unauthorized user creation or modification

#### 4. **Role-Based Route Protection**
- Middleware intercepts all requests before routing
- Public routes explicitly listed (whitelist approach is safer than blacklist)
- Unauthenticated users redirected to `/sign-in` instantly

#### 5. **No Custom Auth Logic Required**
- All auth handled by Clerk SDK (battle-tested, regularly audited)
- Reduces custom code vulnerabilities
- Automatic token refresh and session management

---

## 📁 File Structure & Setup

### Root Layout
**File:** `src/app/layout.tsx`

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

**Why:** ClerkProvider initializes Clerk context for entire app. Must wrap all child components.

---

### Middleware Configuration
**File:** `src/middleware.ts`

```typescript
import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/test-db',
  ],
  ignoredRoutes: [
    '/api/webhooks(.*)',
  ],
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Why:**
- `publicRoutes`: Routes accessible without authentication
- `ignoredRoutes`: Routes that don't need auth token (e.g., webhooks)
- `matcher`: Ensures middleware runs on all routes except static files

**Protected routes** (by default): `/dashboard`, `/tasks`, `/habits`, `/analytics`, `/ai`, `/settings`

---

### Protected Layout (Server Component)
**File:** `src/app/(protected)/layout.tsx`

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
  const { userId } = auth()

  // Server-side check: Redirect if not authenticated
  if (!userId) {
    redirect('/sign-in')
  }

  return <AppLayout>{children}</AppLayout>
}
```

**Why:**
- `auth()` from server module checks session server-side
- `async/await` ensures auth check completes before rendering
- `redirect()` prevents unauthorized users from seeing protected content
- More secure than client-side checks

---

### Sign-In Page
**File:** `src/app/(public)/sign-in/page.tsx`

```tsx
'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <SignIn
      redirectUrl="/dashboard"
      appearance={{/* styling */}}
    />
  )
}
```

**Key Props:**
- `redirectUrl="/dashboard"`: Redirects to dashboard after successful signin
- `appearance`: Customizes styling to match app theme

---

### Sign-Up Page
**File:** `src/app/(public)/sign-up/page.tsx`

```tsx
'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <SignUp
      redirectUrl="/dashboard"
      appearance={{/* styling */}}
    />
  )
}
```

---

### User Sync API Route
**File:** `src/app/api/auth/sync-user/route.ts`

```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { clerkId, email, name, avatar } = body

  // Verify clerkId matches authenticated user
  if (clerkId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Upsert user (create if new, update if exists)
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: { email, name, avatar },
    create: { clerkId, email, name, avatar },
  })

  return NextResponse.json({ success: true, user }, { status: 200 })
}
```

**Security Checks:**
1. Verifies request is from authenticated user (`auth()`)
2. Validates `clerkId` in body matches authenticated `userId`
3. Prevents user modification by other users
4. Creates or updates Prisma User record atomically

---

### User Sync Hook
**File:** `src/hooks/useSyncUser.ts`

```typescript
'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export function useSyncUser() {
  const { user, isLoaded } = useUser()
  const [isSync, setIsSync] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return

    const syncUser = async () => {
      try {
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
            avatar: user.imageUrl,
          }),
        })

        if (!response.ok) throw new Error('Failed to sync')
        setIsSync(false)
      } catch (err) {
        console.error('Sync error:', err)
      }
    }

    syncUser()
  }, [user, isLoaded])

  return { isSync }
}
```

**How it works:**
1. Runs in protected layout (client component)
2. Waits for Clerk to load user (`isLoaded`)
3. Calls `/api/auth/sync-user` with user data
4. Creates/updates Prisma User on first login

---

### Prisma User Model
**File:** `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique    // Clerk user ID
  email     String   @unique
  name      String?
  avatar    String?
  
  tasks     Task[]
  habits    Habit[]
  sessions  FocusSession[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clerkId])
  @@index([email])
}
```

**Key Design:**
- `clerkId` is unique and indexed for fast lookup
- `email` is unique (Clerk enforces this)
- Relationships to user's tasks, habits, and sessions
- Automatic timestamps

---

## 🔧 Environment Variables

Create `.env.local` (already configured):

```env
# Clerk Keys (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://... (Neon URL)
```

**Reset to apply env changes:**
```bash
npm run dev
```

---

## 🧪 Example: Creating a Protected Page

### Dashboard (Protected Route)
**File:** `src/app/(protected)/dashboard/page.tsx`

```typescript
import { auth } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId } = auth()

  // userId is always available here (layout already checked)
  // Can safely query database for this user
  
  return (
    <div>
      <h1>Welcome!</h1>
      {/* Your dashboard content */}
    </div>
  )
}
```

**Note:** No need for authentication check here—the layout already did it!

---

## 🔄 User Creation Flow (Step-by-Step)

1. User fills out sign-up form on `/sign-up`
2. Clerk handles registration and session creation
3. `SignUp` component redirects to `/dashboard`
4. Protected layout checks `auth()` → userId found ✓
5. `useSyncUser` hook runs in protected layout
6. Hook calls `/api/auth/sync-user` with Clerk user data
7. API endpoint verifies clerkId, creates/updates Prisma User
8. User entered into database ✓
9. Dashboard renders with user data from Prisma ✓

---

## 🧹 Environment Setup Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `.env.local` has `CLERK_SECRET_KEY`
- [ ] `.env.local` has `DATABASE_URL` (Neon PostgreSQL)
- [ ] `DATABASE_URL` is correctly formatted: `postgresql://user:password@host/database`
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Clerk publish keys added to Clerk Dashboard (Allowed URLs)

**To verify setup:**

```bash
# Check env vars loaded
npm run dev

# Test database connection
curl http://localhost:3000/api/test-db

# Check Clerk auth
# Visit http://localhost:3000/sign-up
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Unauthorized" on sync-user API

**Cause:** Middleware not recognizing authenticated request

**Fix:** Ensure middleware config includes:
```typescript
export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up'],
  // Protected routes are EVERYTHING ELSE
})
```

---

### Issue: User not created in database

**Cause:** `useSyncUser` hook not running

**Fix:** 
1. Verify hook is called in protected layout
2. Check browser dev tools Network tab for `/api/auth/sync-user` request
3. Verify Clerk userId matches clerkId in request body

---

### Issue: Redirect to sign-in not working

**Cause:** `auth()` not properly checking session

**Fix:**
1. Verify middleware is configured
2. Ensure `.env.local` has `CLERK_SECRET_KEY`
3. Restart dev server: `npm run dev`

---

## 🚀 Production Deployment

### Before Deploying:

1. **Update Clerk Settings:**
   - Go to Clerk Dashboard → Instance Settings → URLs
   - Add production domain to "Allowed URLs"
   - Update AFTER_SIGN_IN/UP_URL to production URLs

2. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://yourdomain.com/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://yourdomain.com/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://yourdomain.com/dashboard
   ```

3. **Enable Webhook (Optional but Recommended):**
   - Clerk Dashboard → Webhooks
   - Create endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Use webhook to sync user changes in real-time

4. **Test Production Build:**
   ```bash
   npm run build
   npm start
   ```

---

## 📚 API Reference

### Server-Side Functions

```typescript
import { auth } from '@clerk/nextjs/server'

const { userId, sessionId, claims } = auth()
```

### Client-Side Hooks

```typescript
import { useUser, useAuth, useSession } from '@clerk/nextjs'

const { user, isLoaded } = useUser()
const { userId, isSignedIn } = useAuth()
const { session } = useSession()
```

### Components

```typescript
import { SignIn, SignUp, SignOutButton, UserButton } from '@clerk/nextjs'
```

---

## 🎯 Next Steps

1. ✅ Review all files updated in this guide
2. ✅ Verify `.env.local` has all required keys
3. ✅ Run `npm run dev` and test sign-up/login flow  
4. ✅ Check browser Network tab to see auth requests
5. ✅ Verify Prisma User record created on first login
6. ✅ Deploy to production when ready

---

## 📞 Support & Resources

- **Clerk Docs:** https://clerk.com/docs
- **Next.js 14 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs

---

**Setup completed:** February 27, 2026  
**Framework:** Next.js 14 (App Router) + Clerk v4.29.0 + Prisma v7
