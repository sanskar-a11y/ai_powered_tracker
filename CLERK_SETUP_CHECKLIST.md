# Clerk + Next.js 14 Setup Checklist

## ✅ Code Configuration (DONE)

- [x] ClerkProvider wraps app in `src/app/layout.tsx`
- [x] `<SignIn />` component in `src/app/(public)/sign-in/page.tsx`
- [x] `<SignUp />` component in `src/app/(public)/sign-up/page.tsx`
- [x] Middleware has `'/sign-up(.*)'` in publicRoutes
- [x] `useSyncUser()` hook called in protected layout
- [x] `afterSignUpUrl` and `afterSignInUrl` set to `/dashboard`
- [x] Prisma sync endpoint at `src/app/api/auth/sync-user/route.ts`

## 🔧 Required Setup (DO THIS BEFORE TESTING)

### 1. Create `.env.local` File
Copy template:
```bash
# From .env.example
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=postgresql://...
NEXT_PUBLIC_GOOGLE_API_KEY=AIza...
```

### 2. Get Clerk API Keys
1. Go to https://dashboard.clerk.com
2. Click "API Keys" in sidebar
3. Copy **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy **Secret Key** → `CLERK_SECRET_KEY`
5. Paste into `.env.local`

### 3. Verify Environment Variables
```bash
# DO NOT commit .env.local
git add .gitignore
# Make sure .env.local is in .gitignore
```

## 🧪 Testing the Flow

### Step 1: Start Dev Server
```bash
npm run dev
# Should start on http://localhost:3000
```

### Step 2: Test Sign-Up Flow
1. Visit http://localhost:3000
2. Click "Sign Up"
3. Fill in email, password, name
4. Should automatically verify and redirect to `/dashboard`
5. No 404 on `/sign-up/verify-email-address` ✅

### Step 3: Verify Database Sync
1. Open new terminal
2. Run `npx prisma studio`
3. Should open http://localhost:5555
4. Go to "User" table
5. Should see your test account with:
   - `clerkId` = your clerk ID
   - `email` = your email
   - `name` = your name
   - `avatar` = your profile picture

### Step 4: Test Sign-Out & Sign-Back-In
1. Click user menu in top right
2. Click "Sign Out"
3. Visit http://localhost:3000/dashboard
4. Should redirect to `/sign-in` ✅
5. Sign in again
6. Should go directly to `/dashboard` ✅

## 🐛 If You Get 404

**Problem:** `/sign-up/verify-email-address` returns 404

**Solution:** 
The middleware must have `'/sign-up(.*)'` in publicRoutes:
```typescript
publicRoutes: [
  '/sign-up(.*)',  // ← This line is critical
],
```

**Why?** Clerk handles email verification as a nested route that doesn't exist as a file. The middleware must allow it through.

## 🐛 If User Is Not Syncing to Database

**Problem:** User logs in but database is empty

**Solution:**
1. Check that `/dashboard` is in protected layout with router group `(protected)`
2. Verify `useSyncUser()` hook is imported and called:
   ```tsx
   const { isSync, error } = useSyncUser();
   ```
3. Check browser console for network error on `/api/auth/sync-user`
4. Check server console for errors in sync endpoint

## 🐛 If You Get Infinite Redirect

**Problem:** Signed in but redirects forever

**Solution:**
- Check `afterSignUpUrl` doesn't point back to `/sign-up`
- Check `/dashboard` is in `(protected)` router group
- Check middleware allows unauthenticated access to sign pages:
  ```typescript
  publicRoutes: ['/sign-in', '/sign-up', '/sign-up(.*)']
  ```

## 📊 Expected Results After Setup

| Step | Expected | Status |
|------|----------|--------|
| Visit /sign-up | See Clerk sign-up form | ✅ |
| Fill & submit form | Verify email prompt (no 404) | ✅ |
| Click verification link | Redirect to /dashboard | ✅ |
| Visit /dashboard | See dashboard UI | ✅ |
| Check database | User in Prisma User table | ✅ |
| Sign out | Redirect to /sign-in | ✅ |
| Sign in again | Redirect to /dashboard | ✅ |

## 📚 Documentation Files

- [CLERK_APP_ROUTER_SETUP.md](CLERK_APP_ROUTER_SETUP.md) - Detailed setup guide
- [.env.example](.env.example) - Environment variables template

## 🚀 Ready to Deploy?

Before deploying to production:
1. ✅ Test entire auth flow locally
2. ✅ Verify user syncs to database
3. ✅ Set production environment variables in hosting provider
4. ✅ Test on staging first
5. ✅ Monitor Clerk dashboard for errors

## 📞 Resources

- Clerk Docs: https://clerk.com/docs
- Next.js 14 App Router: https://nextjs.org/docs/app
- Prisma Docs: https://www.prisma.io/docs
