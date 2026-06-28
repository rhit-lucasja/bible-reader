import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
    const { nextUrl, auth: session } = req
    const isLoggedIn = !!session

    // define which paths require authentication
    const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/bookmarks') ||
        nextUrl.pathname.startsWith('/history') ||
        nextUrl.pathname.startsWith('/settings')

    // redirect unauthenticated users away from protected routes
    const isAuthRoute = nextUrl.pathname.startsWith('/auth')
    if (isProtectedRoute && !isLoggedIn) {
        const redirectUrl = new URL('/auth/signin', nextUrl)
        redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // redirect authenticated users away from auth pages
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/', nextUrl))
    }

    return NextResponse.next()

})

export const config = {
    matcher: [
        // match all routes except static files and Next.js internals
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
}