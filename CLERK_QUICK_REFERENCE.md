# Clerk + Prisma Integration - Quick Reference

## 🔐 Authentication Flow

```
User visits /dashboard (protected route)
           ↓
    Middleware checks auth
           ↓
  Not authenticated? → Redirects to /sign-in
           ↓
  Authenticated? → Renders protected layout
           ↓
  useSyncUser() hook fires
           ↓
  POST /api/auth/sync-user
           ↓
  Creates/updates user in Prisma
           ↓
  User.clerkId = Clerk user ID
           ↓
  Dashboard renders with user data
```

---

## 💾 Getting User ID in Different Contexts

### **Client Component**
```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { user } = useUser();
  console.log(user?.id);  // Clerk user ID
  console.log(user?.firstName);
}
```

### **Server Component**
```typescript
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function Dashboard() {
  const { userId } = auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  return <div>Hello, {user?.name}</div>;
}
```

### **API Route**
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = auth();
  // userId is Clerk user ID, use in queries with clerkId field
  return Response.json({ userId });
}
```

---

## 📝 Common Database Patterns

### **Get User's Data**
```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: userId },
  include: { tasks: true, habits: true },
});
```

### **Create Content for User**
```typescript
const task = await prisma.task.create({
  data: {
    title: 'New task',
    user: {
      connect: { clerkId: userId },
    },
  },
});
```

### **Query User's Content**
```typescript
const tasks = await prisma.task.findMany({
  where: {
    user: { clerkId: userId },
  },
});
```

### **Update User Data**
```typescript
await prisma.user.update({
  where: { clerkId: userId },
  data: { name: 'New name' },
});
```

---

## 🛡️ Protected Routes

**Automatically protected (redirect to /sign-in):**
- `/dashboard`
- `/tasks`
- `/habits`
- `/analytics`
- `/ai`
- `/settings`
- `/api/protected/*`

**To add more protected routes:**
Edit `src/middleware.ts` and add to `isProtectedRoute`:
```typescript
const isProtectedRoute = createRouteMatcher([
  '/my-new-feature(.*)',  // New protected route
  '/dashboard(.*)',
  // ... rest
]);
```

---

## 🔄 Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env.local` | Public Clerk key (exposed to client) |
| `CLERK_SECRET_KEY` | `.env.local` | Secret Clerk key (server only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `.env` | Where to redirect for sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `.env` | Where to redirect for sign-up |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `.env` | After successful sign-in redirect |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `.env` | After successful sign-up redirect |

---

## 🧪 Quick Test Commands

```bash
# Start dev server
npm run dev

# Test database connection
curl http://localhost:3000/api/test-db

# View database in UI
npx prisma studio

# Build for production
npm run build

# Start production build
npm run start
```

---

## 🚫 Common Mistakes

❌ **DON'T:** Use `userId` directly as database ID
```typescript
// WRONG - userId is Clerk ID, not Prisma ID
await prisma.task.create({
  data: { userId: userId },  // This is wrong!
});
```

✅ **DO:** Use Clerk ID to find Prisma user first
```typescript
// RIGHT - clerkId links Clerk to Prisma
const task = await prisma.task.create({
  data: {
    user: { connect: { clerkId: userId } },
  },
});
```

❌ **DON'T:** Put environment variables in code
```typescript
// WRONG - never do this!
const CLERK_KEY = 'pk_test_abc123';
```

✅ **DO:** Load from environment
```typescript
// RIGHT
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
```

---

## 📞 Support Paths

1. Check status: `http://localhost:3000/api/test-db`
2. View data: `npx prisma studio`
3. Check logs: Browser console + terminal
4. Clerk dashboard: https://dashboard.clerk.com/
5. Database: https://console.neon.tech/

---

## ✅ Checklist Before Building Features

- [ ] Can sign up at `/sign-up`
- [ ] Can sign in at `/sign-in`
- [ ] User appears in Prisma Studio after sign-up
- [ ] Can access `/dashboard` after login
- [ ] `/dashboard` redirects to `/sign-in` when logged out
- [ ] User name shows correctly in header
- [ ] `npx prisma studio` shows your user record
