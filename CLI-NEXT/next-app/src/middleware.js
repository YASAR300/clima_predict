import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
];

const PROTECTED_PATHS = [
    '/profile',
    '/settings',
    '/crop-health',
    '/farming-recommendations',
    '/sensors',
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow API routes (except auth)
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        return NextResponse.next();
    }

    // Allow static files
    if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        return NextResponse.next();
    }

    // Check if path requires authentication
    const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    if (requiresAuth) {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }

        try {
            // Verify JWT token
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            // Invalid token, redirect to login
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(url);
            response.cookies.delete('auth_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
