import type { Product } from './types'

interface DisplayProduct {
  id: string
  emoji: string
  bg: string
  badge: string
  badgeClass: string
  name: string
  price: number
  category: string
  moq: number
}

const CATEGORY_META: Record<string, { emoji: string; bg: string }> = {
  'Beauté': { emoji: '🧴', bg: '#FFF0E6' },
  'Électronique': { emoji: '🎧', bg: '#E8F0FE' },
  'Mode Femme': { emoji: '👗', bg: '#FEF3E8' },
  'Mode Homme': { emoji: '👔', bg: '#EEF2FF' },
  'Maison & Cuisine': { emoji: '🪴', bg: '#F0FAE8' },
  'Accessoires': { emoji: '💼', bg: '#F5F0FF' },
  'Jouets': { emoji: '🧸', bg: '#FFF7E6' },
}

export function toDisplayProduct(p: Product): DisplayProduct {
  const meta = CATEGORY_META[p.category ?? ''] ?? { emoji: '📦', bg: '#F5F5F5' }
  const stock = p.stock ?? 99
  const badge = stock <= 5 ? 'Se termine bientôt' : stock >= 50 ? 'Nouveau' : ''
  const badgeClass = stock <= 5 ? 'badge-ending' : stock >= 50 ? 'badge-new' : ''

  return {
    id: p.id,
    emoji: meta.emoji,
    bg: meta.bg,
    badge,
    badgeClass,
    name: p.name,
    price: p.price_cfa,
    category: p.category ?? 'Divers',
    moq: 1,
  }
}

export const DEMO_PRODUCTS: DisplayProduct[] = [
  { id: '1', emoji: '🧴', bg: '#FFF0E6', badge: 'Nouveau', badgeClass: 'badge-new', name: 'Sérum Vitamine C 30ml', price: 4500, category: 'Beauté', moq: 2 },
  { id: '2', emoji: '🎧', bg: '#E8F0FE', badge: 'Populaire', badgeClass: 'badge-hot', name: 'Écouteurs Bluetooth TWS', price: 18000, category: 'Électronique', moq: 1 },
  { id: '3', emoji: '🪴', bg: '#F0FAE8', badge: '', badgeClass: '', name: 'Pot décoratif en céramique', price: 7200, category: 'Maison & Cuisine', moq: 3 },
  { id: '4', emoji: '👗', bg: '#FEF3E8', badge: 'Se termine bientôt', badgeClass: 'badge-ending', name: "Robe d'été florale S-XL", price: 14500, category: 'Mode Femme', moq: 2 },
  { id: '5', emoji: '💼', bg: '#EEF2FF', badge: '', badgeClass: '', name: 'Sac en cuir synthétique', price: 22000, category: 'Accessoires', moq: 1 },
  { id: '6', emoji: '🪞', bg: '#FEE8E8', badge: 'Nouveau', badgeClass: 'badge-new', name: 'Miroir LED tactile 60cm', price: 35000, category: 'Maison & Cuisine', moq: 1 },
]

export type { DisplayProduct }
