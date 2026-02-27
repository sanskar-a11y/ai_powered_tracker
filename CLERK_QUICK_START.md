# Clerk Authentication - Quick Reference

**Last Updated:** February 27, 2026

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (already done)
npm install @clerk/nextjs

# 2. Set environment variables
# Edit .env.local with:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY  
# - DATABASE_URL

# 3. Start development server
npm run dev

# 4. Verify database connection
curl http://localhost:3000/api/test-db

# 5. Test authentication
# Visit http://localhost:3000/sign-up
# Create an account and verify redirect to /dashboard
```

---

## 📁 Key Files at a Glance

| File | Purpose | Must-Have |
|------|---------|-----------|
| `src/app/layout.tsx` | ClerkProvider wrapper | ✅ |
| `src/middleware.ts` | Route protection | ✅ |
| `src/app/(protected)/layout.tsx` | Server-side auth check | ✅ |
| `src/app/(public)/sign-in/page.tsx` | Clerk sign-in form | ✅ |
| `src/app/(public)/sign-up/page.tsx` | Clerk sign-up form | ✅ |
| `src/app/api/auth/sync-user/route.ts` | User sync endpoint | ✅ |
| `src/hooks/useSyncUser.ts` | Sync hook | ✅ |
| `prisma/schema.prisma` | User model | ✅ |
| `.env.local` | Environment variables | ✅ |

---

## 🔐 Authentication Flow Diagram

```
User visits /sign-up
       ↓
Fills form & clicks sign-up
       ↓
Clerk handles registration & creates session
       ↓
SignUp component redirects to /dashboard
       ↓
Middleware checks auth() → userId found ✓
       ↓
Protected layout checks auth() → userId found ✓
       ↓
useSyncUser hook fires → calls /api/auth/sync-user
       ↓
API endpoint creates User record in Prisma
       ↓
Dashboard page loads with authenticated user
       ↓
Header displays user name from Clerk
```

---

## 🛡️ Security Layers

```
Layer 1: Middleware (Edge)
├─ Checks request authentication
├─ Redirects unauthenticated to /sign-in
└─ Runs before page renders

Layer 2: Protected Layout (Server)
├─ Calls auth() server-side
├─ Blocks unauthorized renders
└─ Instant redirection with no page flash

Layer 3: API Validation (Server)
├─ Verifies userId in request
├─ Validates clerkId matches userId
├─ Prevents unauthorized DB writes
└─ Returns 401 if invalid

Layer 4: Database Constraints (Neon)
├─ clerkId UNIQUE constraint
├─ email UNIQUE constraint
└─ Foreign key relationships
```

---

## 📝 Code Snippets

### Creating a Protected Page
```typescript
// src/app/(protected)/my-page/page.tsx

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export default async function MyPage() {
  const { userId } = auth()  // Always has value here
  
  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  return <div>Welcome {user?.name}!</div>
}
```

### Using User in Client Component
```typescript
// 'use client' component inside protected route

import { useUser, useAuth } from '@clerk/nextjs'

export default function MyComponent() {
  const { user } = useUser()
  const { userId, isSignedIn } = useAuth()
  
  if (!isSignedIn) return <div>Loading...</div>
  
  return <div>Hello {user?.firstName}!</div>
}
```

### Server-Side User Lookup
```typescript
// API route or server action

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  return Response.json(user)
}
```

### Sign Out
```typescript
// In any client component

import { SignOutButton } from '@clerk/nextjs'

export default function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <button>Sign Out</button>
    </SignOutButton>
  )
}
```

---

## ⚙️ Environment Variables

```env
# Clerk Keys (from Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://user:pass@host/dbname
```

---

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Generate new migration
npx prisma migrate dev --name add_feature

# Reset database (dev only)
npx prisma migrate reset
```

---

## ❌ Troubleshooting

### Problem: "Clerk API key is missing"
```bash
# Solution: Check .env.local
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# If empty, add to .env.local and restart
npm run dev
```

### Problem: Redirect to /sign-in not working
```bash
# Solution: Check middleware is configured
# File: src/middleware.ts should exist
# Contains: export default authMiddleware({...})

# Restart server
npm run dev

# Clear browser cache: Ctrl+Shift+Delete (Chrome)
```

### Problem: User not created in database
```bash
# Solution 1: Check if hook is running
# Open DevTools → Network tab
# Try signing up again
# Should see: POST /api/auth/sync-user → 200 OK

# Solution 2: Check database schema
npx prisma studio
# Verify User table exists with clerkId column

# Solution 3: Check API errors
# DevTools → Console → Look for fetch errors
```

### Problem: "Unauthorized" on protected page
```bash
# Solution: Verify auth() returns userId
# Update protected layout:

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Layout({ children }) {
  const session = auth()
  console.log('Auth session:', session)  // Debug
  
  if (!session.userId) redirect('/sign-in')
  return <>{children}</>
}
```

### Problem: Session not persisting
```bash
# Solution: Check cookies in DevTools
# Application → Cookies → localhost:3000
# Should have: __clerk_db_jwt

# If missing:
# 1. Clear all cookies
# 2. Hard refresh: Ctrl+F5
# 3. Sign in again
```

---

## 🧪 Manual Testing Commands

### Test Sign-Up API
```bash
# Not recommended for manual testing - use UI instead
# But here's the endpoint:

# 1. Create account via http://localhost:3000/sign-up (UI)
# 2. Verify redirect to /dashboard
# 3. Check database:

npx prisma studio
# Look for User record with new email
```

### Test Protected Route
```bash
# 1. Open http://localhost:3000/dashboard in private window
# Should redirect to /sign-in

# 2. Sign in via /sign-in
# Should redirect to /dashboard

# 3. Visits stay on /dashboard (no redirect)
```

### Test Sign-Out
```bash
# 1. Click Logout button
# Should redirect to /

# 2. Try accessing /dashboard
# Should redirect to /sign-in (session cleared)
```

---

## 📊 Request/Response Examples

### Sign-Up Flow

**Step 1: Form Submission**
```
POST /api/clerk_webhook (internal)
Content-Type: application/json

{
  "event": "user.created",
  "data": {
    "id": "user_xxxxx",
    "primary_email_address": "user@example.com",
    "first_name": "John"
  }
}
```

**Step 2: Sync User**
```
POST /api/auth/sync-user
Content-Type: application/json
Authorization: Bearer <clerk_session>

{
  "clerkId": "user_xxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cuid_xxxxx",
    "clerkId": "user_xxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-27T..."
  }
}
```

---

## 🎯 Production Checklist

Before deploying:

- [ ] All `.env.local` variables set
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Clerk webhook configured (optional but recommended)
- [ ] Clerk Dashboard updated with production URLs
- [ ] Environment variables added to hosting platform
- [ ] Test full flow locally: `npm run build && npm start`
- [ ] Test in production environment
- [ ] Monitor Clerk dashboard for errors
- [ ] Set up error logging (Sentry, LogRocket, etc.)

---

## 📚 Documentation Links

- **Clerk Docs:** https://clerk.com/docs
- **Clerk Next.js Integration:** https://clerk.com/docs/quickstarts/nextjs
- **Next.js 14 App Router:** https://nextjs.org/docs/app
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon PostgreSQL:** https://neon.tech/docs

---

## 🆘 Getting Help

1. **Check the error message** - Usually tells you exactly what's wrong
2. **Review [CLERK_IMPLEMENTATION_GUIDE.md](CLERK_IMPLEMENTATION_GUIDE.md)** - Detailed explanations
3. **Use [CLERK_VERIFICATION_CHECKLIST.md](CLERK_VERIFICATION_CHECKLIST.md)** - Step-by-step verification
4. **Check Clerk Dashboard** - Logs, settings, webhooks
5. **DevTools** - Network tab, Console, Application/Storage
6. **Prisma Studio** - View database records: `npx prisma studio`

---

**Happy authenticating! 🚀**
