import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set(state => {
        const existing = state.items.find(i => i.product_id === newItem.product_id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.product_id === newItem.product_id
                ? { ...i, quantity: i.quantity + newItem.quantity, color: newItem.color ?? i.color, size: newItem.size ?? i.size, image: newItem.image ?? i.image }
                : i
            )
          }
        }
        return { items: [...state.items, newItem] }
      }),

      removeItem: (productId) => set(state => ({
        items: state.items.filter(i => i.product_id !== productId)
      })),

      updateQty: (productId, qty) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => i.product_id !== productId)
          : state.items.map(i => i.product_id === productId ? { ...i, quantity: qty } : i)
      })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'safel-cart' }
  )
)
