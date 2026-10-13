import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color?: string, size?: string) => void
  updateQty: (productId: string, qty: number, color?: string, size?: string) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

const same = (a: CartItem, productId: string, color?: string, size?: string) =>
  a.product_id === productId &&
  (a.color ?? '') === (color ?? '') &&
  (a.size ?? '') === (size ?? '')

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set(state => {
        const existing = state.items.find(i => same(i, newItem.product_id, newItem.color, newItem.size))
        if (existing) {
          return {
            items: state.items.map(i =>
              same(i, newItem.product_id, newItem.color, newItem.size)
                ? { ...i, quantity: i.quantity + newItem.quantity, image: newItem.image ?? i.image }
                : i
            )
          }
        }
        return { items: [...state.items, newItem] }
      }),

      removeItem: (productId, color, size) => set(state => ({
        items: state.items.filter(i => !same(i, productId, color, size))
      })),

      updateQty: (productId, qty, color, size) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => !same(i, productId, color, size))
          : state.items.map(i => same(i, productId, color, size) ? { ...i, quantity: qty } : i)
      })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'safel-cart' }
  )
)
