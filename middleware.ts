import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'safel2025'
const COOKIE_NAME = 'safel_admin_session'
const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow the login page itself
  if (pathname === '/admin/login') return NextResponse.next()

  // Check session cookie
  const session = request.cookies.get(COOKIE_NAME)
  if (session?.value === COOKIE_VALUE) return NextResponse.next()

  // Handle login form POST
  if (request.method === 'POST') return NextResponse.next()

  // Redirect to login
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
