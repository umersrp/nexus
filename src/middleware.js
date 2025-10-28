import { NextResponse } from 'next/server';

export function middleware(request) {
  const auth = [
    '/login',
    '/signup',
    '/forgot-password',
    '/resend-verification',
    '/debug-auth',
  ];
  const path = request?.nextUrl?.pathname;
  
  // Skip middleware for API routes
  if (path?.startsWith('/api/')) {
    console.log('Skipping middleware for API route:', path);
    return NextResponse.next();
  }
  
  const token = request.cookies?.get('xpdx')?.value ?? null;
  const role = request.cookies?.get('role')?.value ?? null;

  const isAdminRoute = path?.startsWith('/admin');
  const isUserRoute = ['/dashboard', '/my-profile', '/plans', '/'].includes(path);
  const isTokenPublicRoute =
    path?.startsWith('/reset-password/') || path?.startsWith('/verify-email/');

  if (
    !token &&
    !auth.includes(path) &&
    !isTokenPublicRoute &&
    (isUserRoute || isAdminRoute)
  ) {
    console.log('0');
    return NextResponse.redirect(new URL('/login', request.url));
  } else if (token && auth.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (
    (role == 'admin' || role == 'super_admin') &&
    isUserRoute
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  } else if (role == 'user' && ['/'].includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } else if (isAdminRoute && !(role == 'admin' || role == 'super_admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  // Allow request to continue when no redirect rules match
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
