import { supabase, supabaseAdmin } from './supabase'
import type { Product, Cycle, Order } from './types'

export async function getActiveCycle(): Promise<Cycle | null> {
  const { data } = await supabase
    .from('cycles')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('products') as any)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

  const { data } = await query
  return data ?? []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function createOrder(order: {
  cycle_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  items: { product_id: string; quantity: number; color?: string; unit_price: number }[]
  total_amount: number
}): Promise<Order | null> {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
    : String(Math.floor(Math.random() * 900000) + 100000)
  const ref = `SG-${new Date().getFullYear()}-${rand}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newOrder, error } = await (supabase.from('orders') as any)
    .insert({
      cycle_id: order.cycle_id,
      reference: ref,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      total_cfa: order.total_amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error || !newOrder) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('order_items') as any).insert(
    order.items.map(i => ({
      order_id: newOrder.id,
      product_id: i.product_id,
      quantity: i.quantity,
      color: i.color,
      unit_price_cfa: i.unit_price,
    }))
  )

  return newOrder
}

export async function getOrderByRef(ref: string): Promise<Order | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('orders') as any)
    .select('*, order_items(id, quantity, color, unit_price_cfa, products(name, images)), cycles(name)')
    .eq('reference', ref.toUpperCase().trim())
    .single()
  return data
}

// ── Storage ──────────────────────────────────────────────────────────────────

export async function uploadProductImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabaseAdmin.storage.from('product-images').upload(path, file, { upsert: false })
  if (error) { console.error('uploadProductImage:', error.message); return null }
  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function adminGetProducts(): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('products') as any)
    .select('*')
    .eq('is_active', true)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminGetDraftProducts(): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('products') as any)
    .select('*')
    .eq('is_draft', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminActivateDraftProducts(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('products') as any)
    .update({ is_active: true, is_draft: false })
    .eq('is_draft', true)
  return !error
}

export async function adminArchiveActiveProducts(): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('products') as any)
    .update({ is_active: false })
    .eq('is_active', true)
    .eq('is_draft', false)
  return !error
}

export async function adminCreateProduct(product: {
  name: string
  description: string
  price_cfa: number
  price_cny: number | null
  category: string
  colors: string[]
  sizes: string[]
  pointures: string[]
  stock: number
  is_active: boolean
  is_draft?: boolean
  customs_fee_cfa?: number
  images?: string[]
}): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin.from('products') as any)
    .insert({ ...product, images: product.images ?? [] })
    .select()
    .single()
  if (error) { console.error('adminCreateProduct:', error.message); return null }
  return data
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('products') as any)
    .update(updates)
    .eq('id', id)
  return !error
}

export async function adminArchiveProduct(id: string): Promise<boolean> {
  return adminUpdateProduct(id, { is_active: false })
}

export async function adminCreateCycle(name: string, closedAt: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('cycles') as any)
    .insert({ name, status: 'open', closed_at: closedAt })
  return !error
}

// ── Admin extended ────────────────────────────────────────────────────────────

export async function adminGetOrders(): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('orders') as any)
    .select('*, order_items(id, quantity, color, unit_price_cfa, products(id, name, images, customs_fee_cfa)), cycles(name)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminGetOrdersByCycle(cycleId: string): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('orders') as any)
    .select('*, order_items(id, quantity, color, size, unit_price_cfa, products(id, name, images, customs_fee_cfa))')
    .eq('cycle_id', cycleId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminUpdateOrderStatus(id: string, status: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('orders') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  return !error
}

export async function adminUpdateOrderCustomsFee(id: string, fee: number): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('orders') as any)
    .update({ customs_fee_cfa: fee, updated_at: new Date().toISOString() })
    .eq('id', id)
  return !error
}

export async function adminGetCycles(): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('cycles') as any)
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminUpdateCycleStatus(id: string, status: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('cycles') as any)
    .update({ status })
    .eq('id', id)
  return !error
}

export async function adminGetClients(): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('orders') as any)
    .select('customer_name, customer_phone, customer_email, total_cfa, created_at')
    .order('created_at', { ascending: false })
  if (!data) return []
  const map: Record<string, { name: string; phone: string; email: string; orders: number; total: number; since: string }> = {}
  for (const o of data) {
    const key = o.customer_phone ?? o.customer_name
    if (!map[key]) {
      map[key] = { name: o.customer_name, phone: o.customer_phone ?? '', email: o.customer_email ?? '', orders: 0, total: 0, since: o.created_at }
    }
    map[key].orders++
    map[key].total += o.total_cfa ?? 0
  }
  return Object.values(map)
}

export async function adminCreateGuestOrder(data: {
  cycle_id: string
  customer_name: string
  customer_phone: string
  items: { product_id: string; quantity: number; unit_price: number; color?: string; size?: string }[]
  total_amount: number
}): Promise<any | null> {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
    : String(Math.floor(Math.random() * 900000) + 100000)
  const ref = `SG-${new Date().getFullYear()}-${rand}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newOrder, error } = await (supabaseAdmin.from('orders') as any)
    .insert({
      cycle_id: data.cycle_id,
      reference: ref,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      total_cfa: data.total_amount,
      status: 'pending',
      is_guest: true,
    })
    .select()
    .single()
  if (error || !newOrder) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabaseAdmin.from('order_items') as any).insert(
    data.items.map(i => ({
      order_id: newOrder.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price_cfa: i.unit_price,
      color: i.color ?? null,
      size: i.size ?? null,
    }))
  )
  return newOrder
}

export async function adminDeleteOrder(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('orders') as any).delete().eq('id', id)
  return !error
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('products') as any).delete().eq('id', id)
  return !error
}

export async function adminDeleteCycle(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('cycles') as any).delete().eq('id', id)
  return !error
}

export async function adminGetArchivedProducts(): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('products') as any)
    .select('*')
    .eq('is_active', false)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminGetActivityLog(): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('activity_log') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  return data ?? []
}

export async function adminLogActivity(action: string, entityType: string, entityId?: string, details?: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabaseAdmin.from('activity_log') as any)
    .insert({ action, entity_type: entityType, entity_id: entityId ?? null, details: details ?? null })
}

export async function adminGetSettings(): Promise<Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('shop_settings') as any)
    .select('key, value')
  if (!data) return {}
  const result: Record<string, unknown> = {}
  for (const row of data) result[row.key] = row.value
  return result
}

export async function adminUpdateSetting(key: string, value: unknown): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('shop_settings') as any)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  return !error
}

// ── Sous-admins ──────────────────────────────────────────────────────────────

export interface SubAdmin {
  id: string
  email: string
  name: string
  role: 'admin' | 'viewer'
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
}

export const ALL_PERMISSIONS = [
  { key: 'commandes', label: 'Commandes' },
  { key: 'produits', label: 'Produits' },
  { key: 'cycles', label: 'Cycles' },
  { key: 'douane', label: 'Douane' },
  { key: 'clients', label: 'Clients' },
  { key: 'sans_compte', label: 'Achat sans compte' },
  { key: 'archives', label: 'Archives' },
  { key: 'journal', label: 'Journal' },
  { key: 'parametres', label: 'Paramètres' },
]

export async function adminGetSubAdmins(): Promise<SubAdmin[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('admins') as any)
    .select('*')
    .neq('role', 'super_admin')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminCreateSubAdmin(data: {
  email: string
  name: string
  role: 'admin' | 'viewer'
  permissions: Record<string, boolean>
}): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .insert({ ...data, is_active: true })
  if (error) { console.error('adminCreateSubAdmin:', error.message) }
  return !error
}

export async function adminUpdateSubAdmin(id: string, updates: Partial<SubAdmin>): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .update(updates)
    .eq('id', id)
  return !error
}

export async function adminToggleSubAdmin(id: string, isActive: boolean): Promise<boolean> {
  return adminUpdateSubAdmin(id, { is_active: isActive })
}

export async function adminDeleteSubAdmin(id: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin.from('admins') as any)
    .delete()
    .eq('id', id)
  return !error
}

export async function adminGetDashboardStats(): Promise<{
  total: number; revenue: number; pending: number; paid: number; recent: any[]
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin.from('orders') as any)
    .select('id, status, total_cfa, reference, customer_name, customer_phone, created_at')
    .order('created_at', { ascending: false })
  if (!data) return { total: 0, revenue: 0, pending: 0, paid: 0, recent: [] }
  const total = data.length
  const revenue = data.reduce((s: number, o: any) => s + (o.total_cfa ?? 0), 0)
  const pending = data.filter((o: any) => o.status === 'pending').length
  const paid = data.filter((o: any) => o.status === 'paid').length
  const recent = data.slice(0, 10)
  return { total, revenue, pending, paid, recent }
}
