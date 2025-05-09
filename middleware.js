import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  // Get the pathname of the request
  const path = req.nextUrl.pathname;
  
  // Get the token if it exists
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If accessing client dashboard routes and not authenticated, redirect to sign in
  if (path.startsWith('/client/dashboard') || path.startsWith('/client/book')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin?type=client', req.url));
    }
  }
  
  // If accessing staff routes and not authenticated or not staff, redirect
  if (path.startsWith('/staff')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    
    // If user is not a staff member, redirect to client dashboard if they're a client
    if (token.role !== 'staff') {
      if (token.role === 'client') {
        return NextResponse.redirect(new URL('/client/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/client/dashboard/:path*', '/client/book/:path*', '/staff/:path*'],
}; 