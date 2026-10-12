'use client'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  name: string
  phone: string
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { error: null }
}

export async function signUp(email: string, password: string, name: string, phone: string): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (data.user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).insert({ id: data.user.id, name, phone })
  }
  return { error: null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('profiles') as any).select('*').eq('id', userId).single()
  return data ?? null
}
