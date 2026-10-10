import { supabase } from './supabase'
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
    .select('*, order_items(*, products(name))')
    .eq('reference', ref)
    .single()
  return data
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function adminGetProducts(): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('products') as any)
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function adminCreateProduct(product: {
  name: string
  description: string
  price_cfa: number
  price_cny: number | null
  category: string
  colors: string[]
  sizes: string[]
  stock: number
  is_active: boolean
}): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .insert({ ...product, images: [] })
    .select()
    .single()
  if (error) { console.error('adminCreateProduct:', error.message); return null }
  return data
}

export async function adminUpdateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update(updates)
    .eq('id', id)
  return !error
}

export async function adminArchiveProduct(id: string): Promise<boolean> {
  return adminUpdateProduct(id, { is_active: false })
}

export async function adminCreateCycle(name: string, closedAt: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('cycles') as any)
    .insert({ name, status: 'open', closed_at: closedAt })
  return !error
}
