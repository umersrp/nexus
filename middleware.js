import { NextResponse } from 'next/server';

const ADMIN_PREFIX = '/admin';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip next internals and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const role = req.cookies.get('role')?.value;
  const token = req.cookies.get('xpdx')?.value || req.cookies.get('token')?.value;

  // Admin area protection (except admin login)
  if (pathname.startsWith(ADMIN_PREFIX) && pathname !== `${ADMIN_PREFIX}/login`) {
    const isAdminRole = role === 'admin' || role === 'super_admin';
    if (!token || !isAdminRole) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_PREFIX}/login`;
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Prevent showing admin login to already-authenticated admins
  if (pathname === `${ADMIN_PREFIX}/login`) {
    const isAdminRole = role === 'admin' || role === 'super_admin';
    if (token && isAdminRole) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_PREFIX}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  // Optional: redirect admins away from user login to their dashboard
  if (pathname === '/login') {
    const isAdminRole = role === 'admin' || role === 'super_admin';
    if (token && isAdminRole) {
      const url = req.nextUrl.clone();
      url.pathname = `${ADMIN_PREFIX}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|images|static|api).*)',
  ],
};


