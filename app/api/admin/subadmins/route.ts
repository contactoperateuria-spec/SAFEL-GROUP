import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const COOKIE_VALUE = process.env.ADMIN_SESSION_SECRET ?? 'sg_session_ok'
const ADMIN_COOKIE = 'safel_admin_session'
const SUBADMIN_COOKIE = 'safel_subadmin_session'

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const adminCookie = request.cookies.get(ADMIN_COOKIE)
  const subadminCookie = request.cookies.get(SUBADMIN_COOKIE)
  if (adminCookie?.value === COOKIE_VALUE) return true
  if (subadminCookie?.value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabaseAdmin.from('admins') as any)
      .select('permissions')
      .eq('email', subadminCookie.value)
      .eq('is_active', true)
      .single()
    return data?.permissions?.parametres === true
  }
  return false
}

// GET — liste des sous-admins
export async function GET(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from('admins') as any)
    .select('*')
    .neq('role', 'super_admin')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — créer un sous-admin
export async function POST(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json()
  const { email, name, role, permissions, password } = body
  if (!email || !name || !role) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  // Créer le compte Auth côté serveur (email confirmé automatiquement)
  if (password) {
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError && !authError.message.includes('already been registered')) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .insert({ email, name, role, permissions, is_active: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PATCH — activer/désactiver ou modifier un sous-admin
export async function PATCH(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .update(updates)
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — supprimer un sous-admin
export async function DELETE(request: NextRequest) {
  if (!await isAuthorized(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .delete()
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
