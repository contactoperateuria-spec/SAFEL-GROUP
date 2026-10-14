import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'safel2025'
const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'
const ADMIN_COOKIE = 'safel_admin_session'
const SUBADMIN_COOKIE = 'safel_subadmin_session'

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

// GET — retourne qui est connecté + ses permissions
export async function GET(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_COOKIE)
  const subadminCookie = request.cookies.get(SUBADMIN_COOKIE)

  if (adminCookie?.value === COOKIE_VALUE) {
    return NextResponse.json({ type: 'super_admin' })
  }

  if (subadminCookie?.value) {
    const email = subadminCookie.value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabaseAdmin.from('admins') as any)
      .select('name, role, permissions')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    if (!data) return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    return NextResponse.json({ type: 'sub_admin', name: data.name, role: data.role, permissions: data.permissions })
  }

  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
}

// POST — login super admin (password) ou sous-admin (email + password)
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives. Attendez 15 minutes.' }, { status: 429 })
  }

  let body: { password?: string; email?: string; adminPassword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // --- Super admin ---
  if (body.password) {
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
    }
    attempts.delete(ip)
    const response = NextResponse.json({ ok: true, type: 'super_admin' })
    response.cookies.set(ADMIN_COOKIE, COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  }

  // --- Sous-admin ---
  if (body.email && body.adminPassword) {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.adminPassword,
    })
    if (authError) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admin } = await (supabaseAdmin.from('admins') as any)
      .select('name, role, permissions')
      .eq('email', body.email)
      .eq('is_active', true)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Compte désactivé ou non autorisé.' }, { status: 403 })
    }

    attempts.delete(ip)
    const response = NextResponse.json({ ok: true, type: 'sub_admin' })
    response.cookies.set(SUBADMIN_COOKIE, body.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  }

  return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
}

// DELETE — déconnexion
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ADMIN_COOKIE)
  response.cookies.delete(SUBADMIN_COOKIE)
  return response
}
