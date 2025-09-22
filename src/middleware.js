import cryptoJs from 'crypto-js';
import { NextResponse } from 'next/server';

const secretKey = 'your-secret-key'; // Keep this key secure!

// Decrypting the token
const decryptToken = (encryptedToken) => {
  const bytes = cryptoJs.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(cryptoJs.enc.Utf8);
};

export function middleware(request) {
  const auth = ['/login', '/signup'];
  const path = request?.nextUrl?.pathname;
  const token = request.cookies?.get('xpdx')?.value ?? null;
  const role = request.cookies?.get('role')?.value
    ? decryptToken(request.cookies.get('role').value)
    : null;

  if (
    !token &&
    !auth.includes(path) &&
    ['/dashboard', '/my-profile', '/plans', '/'].includes(path)
  ) {
    console.log('0');
    return NextResponse.redirect(new URL('/login', request.url));
  } else if (token && auth.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (
    role == 'admin' &&
    ['/dashboard', '/my-profile', '/plans', '/'].includes(path)
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  } else if (role == 'user' && ['/'].includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/', '/:path*', '/admin/:path*'],
};
