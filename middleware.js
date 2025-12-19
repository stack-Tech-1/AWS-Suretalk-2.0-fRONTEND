// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\suretalk-web\middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  
  // If trying to access admin pages without being on admin login
  if (isAdminPage && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // You can add admin token validation here
    // For now, it just allows access
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/adminDashboard/:path*']
};