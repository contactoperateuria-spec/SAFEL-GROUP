'use client'
import { useState, useEffect, useRef } from 'react'
import { getProducts } from '@/lib/db'
import { toDisplayProduct, DEMO_PRODUCTS, type DisplayProduct } from '@/lib/displayHelpers'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

function pick2(list: DisplayProduct[]): DisplayProduct[] {
  if (list.length <= 2) return list
  const shuffled = [...list].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2)
}

export default function HeroProduits() {
  const [pair, setPair] = useState<DisplayProduct[]>([])
  const [visible, setVisible] = useState(true)
  const allRef = useRef<DisplayProduct[]>([])

  useEffect(() => {
    getProducts()
      .then(data => {
        const list = data.length > 0 ? data.map(toDisplayProduct) : DEMO_PRODUCTS
        allRef.current = list
        setPair(pick2(list))
      })
      .catch(() => {
        allRef.current = DEMO_PRODUCTS
        setPair(pick2(DEMO_PRODUCTS))
      })
  }, [])

  useEffect(() => {
    if (allRef.current.length === 0) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPair(pick2(allRef.current))
        setVisible(true)
      }, 400)
    }, 120000) // 2 minutes
    return () => clearInterval(interval)
  }, [pair])

  if (pair.length === 0) return (
    <div style={{ height: 160, borderRadius: 'var(--radius)', background: 'var(--bg)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
  )

  return (
    <div style={{ transition: 'opacity 0.4s ease', opacity: visible ? 1 : 0 }}>
      {pair.map(p => (
        <div key={p.id} style={{
          background: 'var(--white)', borderRadius: 'var(--radius)', padding: 14,
          display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 8, background: p.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0, overflow: 'hidden', position: 'relative'
          }}>
            {p.image
              ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              : p.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{p.category}</div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>{fmt(p.price)} FCFA</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6 }}>min. 1 pc</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
