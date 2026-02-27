# Clerk Authentication Integration Guide

## ✅ Setup Complete (9/9 Steps)

Your production-grade Clerk authentication is fully configured with modern best practices.

---

## 🎯 Architecture Overview

```
User
  ↓ (Sign up at /sign-up)
Clerk <SignUp /> Component
  ↓ (User created in Clerk)
Redirects to /dashboard
  ↓ (Middleware verifies auth)
Protected Layout (ProtectedLayout)
  ↓ (useSyncUser hook fires)
POST /api/auth/sync-user
  ↓ (Creates/updates user in DB)
Prisma: User record created with clerkId
  ↓ (AppLayout renders)
Dashboard shows user name from Clerk
```

---

## 📋 What's Been Implemented

| Component | Location | Purpose |
|-----------|----------|---------|
| **ClerkProvider** | `src/app/layout.tsx` | Wraps entire app with Clerk context |
| **Middleware** | `src/middleware.ts` | Protects `/dashboard/*`, `/tasks/*`, `/habits/*`, etc. |
| **SignUp Component** | `src/app/(public)/sign-up/page.tsx` | Clerk pre-built sign-up form |
| **SignIn Component** | `src/app/(public)/sign-in/page.tsx` | Clerk pre-built sign-in form |
| **useSyncUser Hook** | `src/hooks/useSyncUser.ts` | Syncs Clerk user to Prisma on first login |
| **Sync API Route** | `src/app/api/auth/sync-user/route.ts` | Creates user in database |
| **Protected Layout** | `src/app/(protected)/layout.tsx` | Calls sync hook, shows loading state |
| **Environment Config** | `.env` + `.env.local` | Clerk keys and redirect URLs |

---

## 🧪 Testing Checklist

### **1. Start Dev Server**
```bash
npm run dev
```
Open: `http://localhost:3000`

### **2. Test Public Routes (No Auth Required)**
- ✓ `http://localhost:3000` - Landing page loads
- ✓ `http://localhost:3000/sign-up` - Sign-up page loads with Clerk form
- ✓ `http://localhost:3000/sign-in` - Sign-in page loads with Clerk form
- ✓ `http://localhost:3000/api/test-db` - Database connection test (should return userCount)

### **3. Test Protected Routes (Auth Required)**
- ✓ `http://localhost:3000/dashboard` - Redirects to `/sign-in` if not authenticated
- ✓ `http://localhost:3000/tasks` - Redirects to `/sign-in` if not authenticated
- ✓ `http://localhost:3000/habits` - Redirects to `/sign-in` if not authenticated

### **4. Test Sign-Up Flow**
1. Visit `http://localhost:3000/sign-up`
2. Fill in email, password, name
3. Verify email (if enabled in Clerk dashboard)
4. Should redirect to `/dashboard` (NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL)
5. Protected layout shows "Setting up your account..." loading state briefly
6. User name appears in top-left (from Clerk)

### **5. Verify User Created in Database**
```bash
npx prisma studio
```
- Open `http://localhost:5555`
- Click on "User" table
- Should see your account with:
  - `clerkId` (matches Clerk user ID)
  - `email` (your email)
  - `name` (your full name)
  - `avatar` (your avatar URL from Clerk)
  - `createdAt`, `updatedAt` timestamps

### **6. Test Sign-Out & Sign-In Flow**
1. Click user menu (top-right) → Sign out
2. You're redirected to `/` (landing page)
3. Visit `/dashboard` → redirects to `/sign-in`
4. Sign in with same credentials
5. Should redirect to `/dashboard`
6. Should NOT create duplicate user in database (upsert prevents this)

### **7. Test Multiple Tabs**
1. Open `/dashboard` in tab 1
2. Open `/sign-in` in tab 2
3. Sign in from tab 2
4. Both tabs should reflect authentication state instantly (Clerk propagates changes)

---

## 🔑 Environment Variables

### **Required in `.env.local`** (Never commit)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
GOOGLE_API_KEY=... (optional, for AI features)
```

### **Safe in `.env`** (Can commit)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 🛡️ Route Protection Details

### **Protected Routes** (Middleware redirects unauthenticated users to `/sign-in`)
- `/dashboard` - Main dashboard
- `/tasks` - Task management
- `/habits` - Habit tracking
- `/analytics` - Analytics dashboard
- `/ai` - AI features
- `/settings` - User settings
- `/api/protected/*` - Protected API endpoints

### **Public Routes** (No authentication required)
- `/` - Landing page
- `/sign-in` - Sign-in page
- `/sign-up` - Sign-up page
- `/api/test-db` - Database health check
- `/api/auth/sync-user` - (POST only, auth validated server-side)

---

## 🔄 User Sync Flow

When user accesses a protected route:

**Step 1: Clerk Verification**
```typescript
// middleware.ts
if (isProtectedRoute(req)) {
  auth().protect();  // Redirects to sign-in if not authenticated
}
```

**Step 2: User Sync Hook**
```typescript
// (protected)/layout.tsx
const { user } = useUser();  // Get Clerk user
const { isSync, error } = useSyncUser();  // Sync to Prisma
```

**Step 3: Database Sync**
```typescript
// /api/auth/sync-user (POST)
await prisma.user.upsert({
  where: { clerkId: user.id },  // Find by Clerk ID
  update: { email, name, avatar },  // Update if exists
  create: { clerkId, email, name, avatar },  // Create if new
});
```

Result: User synced to database with clerkId linking Clerk → Prisma

---

## 📊 Database Schema

### **User Table**
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique          // Links to Clerk
  email     String   @unique
  name      String?
  avatar    String?
  
  tasks     Task[]                     // Relations
  habits    Habit[]
  sessions  FocusSession[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

When you create a task/habit, link it to user:
```typescript
await prisma.task.create({
  data: {
    userId: user.id,  // From Prisma User.id
    title: "...",
  }
});
```

Get current user's ID in server components:
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },  // Query by Clerk ID
  });
}
```

---

## 🚀 Common Tasks

### **Get Current User in Components**
```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return <div>Hello, {user?.firstName}!</div>;
}
```

### **Get Current User in API Routes**
```typescript
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  return Response.json({ user });
}
```

### **Create Task for Current User**
```typescript
const response = await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify({ title: 'New task' }),
});

// In /api/tasks route:
export async function POST(req: Request) {
  const { userId } = auth();
  const { title } = await req.json();
  
  const task = await prisma.task.create({
    data: {
      userId,  // User's Clerk ID (stored as userId in Task)
      title,
    },
  });
  
  return Response.json({ task });
}
```

### **Query User's Tasks**
```typescript
const response = await fetch('/api/tasks');
const { tasks } = await response.json();

// In /api/tasks route:
export async function GET() {
  const { userId } = auth();
  
  const tasks = await prisma.task.findMany({
    where: { 
      user: { clerkId: userId }  // Filter by Clerk user
    },
  });
  
  return Response.json({ tasks });
}
```

---

## 🐛 Troubleshooting

### **"Clerk keys invalid" / Sign-up form doesn't load**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` (starts with `pk_`)
- Verify `CLERK_SECRET_KEY` in `.env.local` (starts with `sk_`)
- Check keys are from same Clerk application (not from different projects)
- Restart dev server: `npm run dev`

### **"User not syncing to database"**
1. Check `/api/test-db` endpoint works first
2. Verify database is connected (Neon)
3. Check browser console for errors in `useSyncUser` hook
4. Look at server logs for `/api/auth/sync-user` errors
5. View Prisma Studio: `npx prisma studio` → Check User table is empty

### **"Protected route redirects to sign-in even after login"**
- Middleware not running: Check `src/middleware.ts` exists at root level
- Clerk keys missing: Check `.env.local` has both keys
- Session stale: Clear browser cookies, try again
- Restart dev server

### **"Email verification loop"**
- Check Clerk dashboard settings for email verification requirement
- If enabled, user needs to verify email before sign-in
- Can be skipped in Clerk dashboard (development mode)

### **"User created multiple times in database"**
- This shouldn't happen (clerkId is unique + upsert)
- If it does, check browser cleared cache/cookies
- Run `npx prisma studio` to verify no duplicates

---

## 📱 Production Deployment

### **Before Deploying**

1. **Remove test endpoint**
   ```bash
   rm src/app/api/test-db/route.ts
   ```

2. **Update Clerk dashboard**
   - Add production domain to Allowed Origins
   - Configure production Clerk keys
   - Enable email verification (if needed)
   - Enable social OAuth (Google, GitHub, etc.)

3. **Update environment variables**
   - Set `NODE_ENV=production` on hosting platform
   - Use production Clerk keys (not test keys)
   - Update redirect URLs to production domain:
     ```env
     NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://yourapp.com/dashboard
     NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://yourapp.com/dashboard
     ```

4. **Run final tests**
   ```bash
   npm run build      # Should succeed
   npm run start      # Test production build locally
   ```

5. **Database migration**
   ```bash
   npx prisma migrate deploy   # Apply migrations to production DB
   ```

---

## 🎓 Next Steps

1. **Build Features**
   - Task CRUD operations
   - Habit tracking
   - Focus sessions
   - Analytics dashboard

2. **Add OAuth** (Social sign-in)
   - Google OAuth (already in Clerk UI)
   - GitHub OAuth (add in Clerk dashboard)

3. **Add Webhooks** (Sync user deletion, etc.)
   - Listen to `user.deleted` event
   - Delete user from Prisma when they delete Clerk account

4. **Add Roles/Permissions**
   - Use Clerk roles for admin functionality
   - Protect admin routes in middleware

5. **Implement AI Features**
   - Use Gemini API (server-side only)
   - Store API key in `.env.local`

---

## 📚 Resources

- **Clerk Docs**: https://clerk.com/docs
- **Next.js + Clerk**: https://clerk.com/docs/quickstarts/nextjs
- **Clerk API Reference**: https://clerk.com/docs/reference/backend-api
- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js App Router**: https://nextjs.org/docs/app

---

## ✨ You're All Set!

Your authentication system is production-ready. Start building features! 🚀
