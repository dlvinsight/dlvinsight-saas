import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
]);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const pathname = request.nextUrl.pathname;

  // Check if it's a webhook endpoint, OAuth endpoint, or health endpoint - handle these first without any auth
  if (
    pathname.startsWith('/api/webhooks/') || 
    pathname.includes('/api/webhooks/') ||
    pathname.startsWith('/api/amazon/oauth/') ||
    pathname.includes('/api/amazon/oauth/') ||
    pathname === '/api/health'
  ) {
    // For webhooks, OAuth, and health endpoints, only apply intl middleware, skip Clerk auth entirely
    return intlMiddleware(request);
  }

  // Check if it's a sign-in/sign-up page or a protected route
  const isSignInOrUp = pathname.includes('/sign-in') || pathname.includes('/sign-up');
  const isProtected = isProtectedRoute(request);
  const isApiRoute = pathname.startsWith('/api/') || pathname.includes('/api/');

  // Apply Clerk middleware for sign-in/up pages, protected routes, and non-webhook API routes
  if (isSignInOrUp || isProtected || isApiRoute) {
    return clerkMiddleware(async (auth, req) => {
      // Only protect if it's a protected route or a non-webhook API route
      if (isProtected || isApiRoute) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      const authObj = await auth();

      // Handle organization selection redirect
      if (
        authObj.userId
        && !authObj.orgId
        && req.nextUrl.pathname.includes('/dashboard')
        && !req.nextUrl.pathname.endsWith('/organization-selection')
      ) {
        const orgSelection = new URL(
          '/onboarding/organization-selection',
          req.url,
        );

        return NextResponse.redirect(orgSelection);
      }

      return intlMiddleware(req);
    })(request, event);
  }

  // For all other routes, just apply intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except:
    // - Static files (containing a dot)
    // - _next paths
    // - monitoring (Sentry tunnel)
    // - api/webhooks paths
    // - api/amazon/oauth paths
    // - api/health path
    '/((?!.+\\.[\\w]+$|_next|monitoring|api/webhooks|api/amazon/oauth|api/health).*)',
    '/',
    // Match API routes but exclude webhooks, OAuth, and health
    '/(api/(?!webhooks|amazon/oauth|health)|trpc)(.*)',
  ],
};
