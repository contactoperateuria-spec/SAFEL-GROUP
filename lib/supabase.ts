import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client admin avec service_role — bypasse le RLS, à utiliser côté serveur uniquement
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY est requis en production.')
}
if (!serviceRoleKey) {
  console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY absent — supabaseAdmin utilise la clé anon (dev uniquement)')
}
export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : supabase
