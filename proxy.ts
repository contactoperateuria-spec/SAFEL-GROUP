import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'safel_admin_session'
const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()

  const session = request.cookies.get(COOKIE_NAME)
  if (session?.value === COOKIE_VALUE) return NextResponse.next()

  if (request.method === 'POST') return NextResponse.next()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
