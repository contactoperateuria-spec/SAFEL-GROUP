import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, color?: string) => void
  updateQty: (productId: string, qty: number, color?: string) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

const same = (a: CartItem, productId: string, color?: string) =>
  a.product_id === productId && (a.color ?? '') === (color ?? '')

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set(state => {
        const existing = state.items.find(i => same(i, newItem.product_id, newItem.color))
        if (existing) {
          return {
            items: state.items.map(i =>
              same(i, newItem.product_id, newItem.color)
                ? { ...i, quantity: i.quantity + newItem.quantity, size: newItem.size ?? i.size, image: newItem.image ?? i.image }
                : i
            )
          }
        }
        return { items: [...state.items, newItem] }
      }),

      removeItem: (productId, color) => set(state => ({
        items: state.items.filter(i => !same(i, productId, color))
      })),

      updateQty: (productId, qty, color) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => !same(i, productId, color))
          : state.items.map(i => same(i, productId, color) ? { ...i, quantity: qty } : i)
      })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'safel-cart' }
  )
)
