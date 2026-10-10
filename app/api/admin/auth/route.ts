import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'safel2025'
const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'
const COOKIE_NAME = 'safel_admin_session'

// Rate limiting: max 5 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; firstAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 15 * 60 * 1000
  const entry = attempts.get(ip)
  if (!entry || now - entry.firstAt > window) {
    attempts.set(ip, { count: 1, firstAt: now })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives. Attendez 15 minutes.' }, { status: 429 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
  }

  // Clear attempt record on success
  const ipKey = request.headers.get('x-forwarded-for') ?? 'unknown'
  attempts.delete(ipKey)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return response
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
