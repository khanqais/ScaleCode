import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const response = NextResponse.next()
  response.headers.set('x-pathname', nextUrl.pathname)

  if (process.env.DISABLE_PRICING === 'true' && nextUrl.pathname === '/pricing') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const protectedRoutes = [
    '/dashboard',
    '/private',
    '/add-problem',
    '/problems',
    '/revision',
    '/main-revision',
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (nextUrl.pathname === '/login' && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl') || '/organize'
    return NextResponse.redirect(new URL(callbackUrl, req.url))
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}