import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSession = request.cookies.get('admin_session')?.value;

  // 1. Proteksi semua rute Admin (/Admin dan /Admin/*)
  if (pathname.startsWith('/Admin')) {
    let isAuthenticated = false;

    if (adminSession) {
      try {
        const decoded = decodeURIComponent(adminSession);
        const user = JSON.parse(decoded);
        if (user && user.role === 'admin') {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    // Jika belum login atau bukan admin, redirect ke halaman login dengan door pass
    if (!isAuthenticated) {
      const loginUrl = new URL('/Login?door=kanagara-admin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Jika admin yang sudah login membuka /Login, otomatis arahkan ke dashboard /Admin
  if (pathname === '/Login' && adminSession) {
    try {
      const decoded = decodeURIComponent(adminSession);
      const user = JSON.parse(decoded);
      if (user && user.role === 'admin') {
        return NextResponse.redirect(new URL('/Admin', request.url));
      }
    } catch {
      // Cookie tidak valid, biarkan akses halaman login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/Admin/:path*',
    '/Login',
  ],
};
