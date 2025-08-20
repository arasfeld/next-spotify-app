import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/callback'];

// Define API routes that should be excluded from auth checks
const apiRoutes = ['/api/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get and decrypt session from cookies
  const sessionCookie = request.cookies.get('session')?.value;
  let session = null;

  try {
    session = await decrypt(sessionCookie);
  } catch (error) {
    // Silently handle session decryption errors
    session = null;
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is authenticated and trying to access login, redirect to home
    if (session?.userId && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url), 307);
    }
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  if (!session?.userId) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url), 307);
  }

  // User is authenticated, allow access to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - electron-app (exclude electron app files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|electron-app).*)',
  ],
};
