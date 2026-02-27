import { authMiddleware } from '@clerk/nextjs';

/**
 * Protected routes that require authentication
 * Clerk automatically handles auth verification for these routes
 */
export default authMiddleware({
  publicRoutes: [
    '/',                    // Home page
    '/sign-in',             // Sign-in page - public
    '/sign-up',             // Sign-up page - public
    '/sign-up(.*)',         // All sign-up routes including /sign-up/verify-email-address
    '/api/test-db',         // Test database endpoint
  ],
  ignoredRoutes: [
    '/api/webhooks(.*)',    // Clerk webhooks
  ],
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
