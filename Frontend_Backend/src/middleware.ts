import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Check if pricing page is disabled
  if (process.env.DISABLE_PRICING === 'true' && nextUrl.pathname === '/pricing') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/private',
    '/add-problem',
    '/problems',
    '/revision',
    '/main-revision',
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to organize (or callbackUrl) if logged in user tries to access login page
  if (nextUrl.pathname === '/login' && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/organize'
    return NextResponse.redirect(new URL(callbackUrl, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}