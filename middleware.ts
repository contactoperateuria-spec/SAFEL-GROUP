import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'safel_admin_session'
const SUBADMIN_COOKIE = 'safel_subadmin_session'
const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()
  if (pathname.startsWith('/api/admin/auth')) return NextResponse.next()

  const adminSession = request.cookies.get(ADMIN_COOKIE)
  const subadminSession = request.cookies.get(SUBADMIN_COOKIE)

  if (adminSession?.value === COOKIE_VALUE) return NextResponse.next()
  if (subadminSession?.value) return NextResponse.next()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
