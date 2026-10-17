export type CycleStatus = 'open' | 'closed' | 'in_transit' | 'arrived' | 'archived'
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'in_transit' | 'in_customs' | 'customs_cleared' | 'ready' | 'delivered' | 'cancelled' | 'refunded'
export type AdminRole = 'super_admin' | 'admin' | 'viewer'

export interface Cycle {
  id: string
  name: string
  status: CycleStatus
  opened_at: string
  closed_at: string | null
  expected_arrival: string | null
  arrived_at: string | null
  notes: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price_cfa: number
  price_cny: number | null
  images: string[]
  colors: string[]
  sizes: string[]
  pointures: string[]
  variants: string[]
  stock: number
  is_active: boolean
  is_draft: boolean
  category: string | null
  customs_fee_cfa: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  cycle_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  status: OrderStatus
  payment_method: string
  payment_proof_url: string | null
  total_cfa: number
  notes: string | null
  is_guest: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price_cfa: number
  color: string | null
  size: string | null
  created_at: string
  product?: Product
}

export interface CartItem {
  product_id: string
  name: string
  emoji: string
  bg: string
  image?: string
  price: number
  quantity: number
  color?: string
  size?: string
}

export interface Database {
  public: {
    Tables: {
      cycles: { Row: Cycle; Insert: Omit<Cycle, 'id' | 'created_at'>; Update: Partial<Cycle> }
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Product> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<OrderItem> }
    }
  }
}
