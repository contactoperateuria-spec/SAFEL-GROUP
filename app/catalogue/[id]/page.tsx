'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'

const PRODUCT = {
  id: '1',
  emoji: '🧴',
  bg: '#FFF0E6',
  name: 'Sérum Vitamine C 30ml — Éclat & Anti-taches',
  category: 'Beauté › Soins visage',
  price: 4500,
  moq: 2,
  sizes: ['30ml', '50ml', '100ml'],
  colors: [
    { name: 'Beige', hex: '#F5D7C0' },
    { name: 'Blanc', hex: '#E8E8E8' },
    { name: 'Noir', hex: '#2C2C2C' },
    { name: 'Rose', hex: '#F4A0B0' },
    { name: 'Bleu', hex: '#6BAED6' },
  ],
}

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function ProductPage() {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes[0])
  const [colorQtys, setColorQtys] = useState<Record<string, number>>({})

  const totalQty = Object.values(colorQtys).reduce((a, b) => a + b, 0)
  const totalPrice = totalQty * PRODUCT.price
  const meetsMin = totalQty >= PRODUCT.moq

  const changeQty = (color: string, delta: number) => {
    setColorQtys(prev => {
      const cur = prev[color] ?? 0
      const next = Math.max(0, Math.min(cur + delta, 99))
      return { ...prev, [color]: next }
    })
  }

  const selections = PRODUCT.colors.filter(c => (colorQtys[c.name] ?? 0) > 0)

  const handleAddToCart = () => {
    const colorSummary = selections.map(c => `${c.name} ×${colorQtys[c.name]}`).join(', ')
    addItem({
      product_id: PRODUCT.id,
      name: PRODUCT.name,
      emoji: PRODUCT.emoji,
      bg: PRODUCT.bg,
      price: PRODUCT.price,
      quantity: totalQty,
      size: selectedSize,
      color: colorSummary,
    })
    router.push('/panier')
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
        <Link href="/">Accueil</Link> ›{' '}
        <Link href="/catalogue">Beauté</Link> ›{' '}
        Sérum Vitamine C
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Galerie */}
        <div>
          <div style={{ aspectRatio: '1', background: PRODUCT.bg, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, marginBottom: 10 }}>
            {PRODUCT.emoji}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['🧴', '🧴', '📦'].map((e, i) => (
              <div key={i} style={{ width: 60, height: 60, borderRadius: 8, background: PRODUCT.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: `2px solid ${i === 0 ? 'var(--orange)' : 'transparent'}`, cursor: 'pointer' }}>{e}</div>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div>
          <span className="product-badge badge-new" style={{ marginBottom: 8 }}>Nouveau · {PRODUCT.category}</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{PRODUCT.name}</h1>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>
            {fmt(PRODUCT.price)} FCFA <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>/ pièce</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
            Frais de douane : fixés à l&apos;arrivée à Lomé · Délai estimé : 30 à 40 jours
          </div>

          {/* Tailles */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Taille</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {PRODUCT.sizes.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                style={{
                  padding: '6px 14px',
                  border: `1.5px solid ${selectedSize === s ? 'var(--orange)' : 'var(--border-2)'}`,
                  borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: selectedSize === s ? 'var(--orange-light)' : 'transparent',
                  color: selectedSize === s ? 'var(--orange-dark)' : 'inherit',
                }}
              >{s}</button>
            ))}
          </div>

          {/* Tableau couleurs + quantités */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
            Couleurs & quantités <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 12 }}>— choisissez plusieurs couleurs</span>
          </div>
          <div style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px', background: 'var(--bg)', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)' }}>
              <span></span>
              <span style={{ paddingLeft: 10 }}>Couleur</span>
              <span style={{ textAlign: 'right' }}>Quantité</span>
            </div>
            {PRODUCT.colors.map(c => {
              const qty = colorQtys[c.name] ?? 0
              return (
                <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 110px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, border: '1.5px solid rgba(0,0,0,.12)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, paddingLeft: 10 }}>{c.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      disabled={qty === 0}
                      onClick={() => changeQty(c.name, -1)}
                      style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: qty === 0 ? 'default' : 'pointer', opacity: qty === 0 ? .35 : 1, color: 'var(--text-2)' }}
                    >−</button>
                    <span style={{ minWidth: 26, textAlign: 'center', fontSize: 14, fontWeight: 600, color: qty === 0 ? 'var(--text-3)' : 'var(--text)' }}>{qty}</span>
                    <button
                      onClick={() => changeQty(c.name, 1)}
                      style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)' }}
                    >+</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Récapitulatif sélection */}
          {selections.length > 0 && (
            <div style={{ background: 'var(--orange-light)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange-dark)', marginBottom: 8 }}>Votre sélection</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {selections.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--white)', border: '1px solid var(--border-2)', borderRadius: 20, padding: '3px 10px 3px 6px', fontSize: 12, fontWeight: 500 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.hex, flexShrink: 0 }} />
                    {c.name} × {colorQtys[c.name]}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{totalQty} pièce{totalQty > 1 ? 's' : ''} au total · min. {PRODUCT.moq}</span>
                <strong style={{ color: 'var(--orange-dark)' }}>{fmt(totalPrice)} FCFA</strong>
              </div>
            </div>
          )}

          {/* Chips info */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[
              { icon: '🚚', label: 'Livraison Lomé & environs' },
              { icon: '📍', label: 'Retrait au dépôt possible' },
              { icon: '🔒', label: 'Paiement sécurisé' },
            ].map(chip => (
              <div key={chip.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)' }}>
                {chip.icon} {chip.label}
              </div>
            ))}
          </div>

          <button
            className="btn-cta"
            disabled={!meetsMin}
            onClick={handleAddToCart}
            style={{ opacity: meetsMin ? 1 : .5, cursor: meetsMin ? 'pointer' : 'not-allowed' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {meetsMin
              ? `Ajouter au panier — ${fmt(totalPrice)} FCFA`
              : `Choisissez au moins ${PRODUCT.moq} pièces (${totalQty}/${PRODUCT.moq})`
            }
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>
            Minimum {PRODUCT.moq} pièces · toutes couleurs confondues · Douane à régler à l&apos;arrivée
          </div>
        </div>
      </div>
    </div>
  )
}
