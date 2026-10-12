'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProducts } from '@/lib/db'
import { toDisplayProduct, type DisplayProduct } from '@/lib/displayHelpers'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const FALLBACK = [
  { id: 'f1', emoji: '🧴', bg: '#FFF0E6', badge: 'Nouveau', badgeClass: 'badge-new', name: 'Sérum Vitamine C 30ml', price: 4500, category: 'Beauté', moq: 2 },
  { id: 'f2', emoji: '🎧', bg: '#E8F0FE', badge: 'Populaire', badgeClass: 'badge-hot', name: 'Écouteurs Bluetooth TWS', price: 18000, category: 'Électronique', moq: 1 },
  { id: 'f3', emoji: '🪴', bg: '#F0FAE8', badge: '', badgeClass: '', name: 'Pot décoratif en céramique', price: 7200, category: 'Maison & Cuisine', moq: 3 },
  { id: 'f4', emoji: '👗', bg: '#FEF3E8', badge: 'Se termine bientôt', badgeClass: 'badge-ending', name: "Robe d'été florale S-XL", price: 14500, category: 'Mode Femme', moq: 2 },
] as DisplayProduct[]

export default function NouveautesSection() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data.length > 0 ? data.slice(0, 4).map(toDisplayProduct) : FALLBACK)
      setLoading(false)
    }).catch(() => { setProducts(FALLBACK); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="product-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ height: 180, background: '#F0F0F0' }} />
          <div style={{ padding: 12 }}>
            <div style={{ height: 14, background: '#E8E8E8', borderRadius: 4, marginBottom: 8, width: '80%' }} />
            <div style={{ height: 16, background: '#E8E8E8', borderRadius: 4, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="product-grid">
      {products.map(p => (
        <Link href={`/catalogue/${p.id}`} key={p.id} className="product-card">
          <div className="product-img" style={{ background: p.bg, position: 'relative', overflow: 'hidden' }}>
            {p.image
              ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              : p.emoji}
          </div>
          <div className="product-body">
            {p.badge && <span className={`product-badge ${p.badgeClass}`}>{p.badge}</span>}
            <div className="product-card-name">{p.name}</div>
            <div className="product-card-price">{fmt(p.price)} FCFA</div>
            <div className="product-card-moq">Min. {p.moq} pc{p.moq > 1 ? 's' : ''}</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
