# Clerk Integration for Next.js 14 App Router

## 🎯 Overview

This guide explains how Clerk authentication works in your Next.js 14 App Router project and why certain configuration is necessary.

## ✅ What's Configured

### 1. **ClerkProvider Setup** (`src/app/layout.tsx`)
```tsx
<ClerkProvider
  appearance={{
    baseTheme: undefined,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#0f172a',
      colorInputBackground: '#1e293b',
      colorInputText: '#f1f5f9',
    },
  }}
>
```
- Wraps entire app to enable Clerk authentication
- Customized appearance to match your dark theme
- **Required:** Must wrap `<html>` element

### 2. **Sign-In & Sign-Up Pages** (Using Clerk Components)
- **`src/app/(public)/sign-in/page.tsx`**
  - Uses `<SignIn />` component from `@clerk/nextjs`
  - Redirects to `/dashboard` after successful sign-in
  - Manages email verification automatically
  
- **`src/app/(public)/sign-up/page.tsx`**
  - Uses `<SignUp />` component from `@clerk/nextjs`
  - Redirects to `/dashboard` after successful sign-up
  - Handles email verification internally

### 3. **Middleware Configuration** (`src/middleware.ts`)
```typescript
publicRoutes: [
  '/',
  '/sign-in',
  '/sign-up',
  '/sign-up(.*)',  // ← Allows /sign-up/verify-email-address
  '/api/test-db',
],
```
- `'/sign-up(.*)'` matches ALL routes under `/sign-up/`
- Clerk handles nested verification routes internally
- **You don't create `/verify-email-address` page manually**

### 4. **Protected Routes** (Using Layout)
- **`src/app/(protected)/layout.tsx`**
  - Calls `useSyncUser()` hook to create/update user in database
  - Syncs Clerk user to Prisma on every protected page load
  - Redirects to sign-in if not authenticated

## 🔄 Authentication Flow

```
1. User visits app
   ↓
2. User clicks "Sign Up"
   ↓
3. User fills form on /sign-up page
   ↓
4. User submits, Clerk redirects to /sign-up/verify-email-address (internally managed)
   ↓
5. User clicks email verification link
   ↓
6. Clerk verifies and redirects to /dashboard (afterSignUpUrl)
   ↓
7. Protected layout loads → useSyncUser() hook syncs to Prisma
   ↓
8. User appears in database
```

## 📋 Required Environment Variables

Copy these to your `.env.local` file (never commit this):

```bash
# Get from https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# URLs for Clerk to find authentication pages
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Where to redirect after successful auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://...

# Gemini AI
NEXT_PUBLIC_GOOGLE_API_KEY=AIza...
```

## ❌ Why NOT to Create `/sign-up/verify-email-address`

### The Problem
```
User tries to sign up
  ↓
Clerk redirects to /sign-up/verify-email-address
  ↓
Your app shows 404 (route doesn't exist)
  ↓
User can't verify email
```

### The Solution
When using Clerk's `<SignUp />` component:
- ✅ Clerk manages ALL nested verification routes internally
- ✅ `/sign-up/verify-email-address` is handled by Clerk's JavaScript SDK
- ✅ User stays in seamless flow without page navigation
- ✅ No 404 errors

## 🔐 Security Features

### 1. **Middleware Protection**
- Runs on every request
- Blocks unauthenticated access to protected routes
- Instant server-side verification (no client-side flashing)

### 2. **Database Sync**
- `useSyncUser()` hook syncs Clerk → Prisma
- Using `.upsert()` prevents duplicates
- `clerkId` is `@unique` in Prisma schema

### 3. **Server-Only Auth Check**
- Backend API routes use `auth()` from `@clerk/nextjs/server`
- Never expose auth decisions to client-side only

## 🛠️ Troubleshooting

### Issue: 404 on /sign-up/verify-email-address
**Solution:** Add `'/sign-up(.*)'` to `publicRoutes` in middleware
```typescript
publicRoutes: ['/sign-up(.*)']  // This allows all /sign-up/* routes
```

### Issue: User not syncing to database
**Solution:** Ensure `useSyncUser()` is called in protected layout
```tsx
// Must be in layout, NOT on individual pages
const { isSync, error } = useSyncUser();
```

### Issue: Infinite redirect loop
**Solution:** Verify `afterSignInUrl` and `afterSignUpUrl` don't redirect back to sign-in
```tsx
afterSignUpUrl="/dashboard"  // ✅ Good
afterSignUpUrl="/sign-up"    // ❌ Bad - creates loop
```

### Issue: Environment variables not loading
**Solution:** Restart dev server after creating `.env.local`
```bash
npm run dev
# Ctrl+C to stop
# npm run dev to restart
```

## 📚 Related Files

- **Auth Setup:** [src/app/layout.tsx](src/app/layout.tsx) - ClerkProvider
- **Sign In:** [src/app/(public)/sign-in/page.tsx](src/app/(public)/sign-in/page.tsx)
- **Sign Up:** [src/app/(public)/sign-up/page.tsx](src/app/(public)/sign-up/page.tsx)
- **Middleware:** [src/middleware.ts](src/middleware.ts)
- **User Sync:** [src/hooks/useSyncUser.ts](src/hooks/useSyncUser.ts)
- **Sync API:** [src/app/api/auth/sync-user/route.ts](src/app/api/auth/sync-user/route.ts)
- **Database:** [src/lib/prisma.ts](src/lib/prisma.ts) - Prisma singleton

## 🚀 Next Steps

1. **Get API Keys from Clerk Dashboard**
   - Go to https://dashboard.clerk.com
   - Click "API Keys"
   - Copy Publishable Key and Secret Key

2. **Create `.env.local`** (copy from `.env.example`)
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   # ... other vars
   ```

3. **Restart dev server**
   ```bash
   npm run dev
   ```

4. **Test the flow**
   - Visit http://localhost:3000/sign-up
   - Create a test account
   - Should redirect to /dashboard and sync to database

5. **Verify database sync**
   ```bash
   npx prisma studio
   # Should see new user in User table
   ```
