'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { getProductById } from '@/lib/db'
import { CATEGORY_META } from '@/lib/displayHelpers'
import type { Product } from '@/lib/types'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

function ProductPageInner() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const addItem = useCartStore(s => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [colorQtys, setColorQtys] = useState<Record<string, number>>({})
  const [sizeQtys, setSizeQtys] = useState<Record<string, number>>({})
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (!id) return
    getProductById(id).then(p => {
      setProduct(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="container" style={{ paddingTop: 48, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Chargement…</div>
  )
  if (!product) return (
    <div className="container" style={{ paddingTop: 48, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Produit introuvable</div>
      <Link href="/catalogue" className="btn-primary" style={{ height: 40, borderRadius: 20, padding: '0 20px', fontSize: 14 }}>Retour au catalogue</Link>
    </div>
  )

  const meta = CATEGORY_META[product.category ?? ''] ?? { emoji: '📦', bg: '#F5F5F5' }
  const images = product.images ?? []
  const colors = product.colors ?? []
  const sizes = product.sizes ?? []

  const colorTotal = Object.values(colorQtys).reduce((a, b) => a + b, 0)
  const sizeTotal = Object.values(sizeQtys).reduce((a, b) => a + b, 0)
  const totalQty = colors.length > 0 ? colorTotal : (sizes.length > 0 ? sizeTotal : (colorQtys._ ?? 1))
  const totalPrice = totalQty * product.price_cfa
  const meetsMin = totalQty >= 1

  const changeColorQty = (color: string, delta: number) =>
    setColorQtys(prev => ({ ...prev, [color]: Math.max(0, Math.min((prev[color] ?? 0) + delta, 9999)) }))

  const setColorQty = (color: string, val: string) =>
    setColorQtys(prev => ({ ...prev, [color]: Math.max(0, Math.min(parseInt(val) || 0, 9999)) }))

  const changeSizeQty = (size: string, delta: number) =>
    setSizeQtys(prev => ({ ...prev, [size]: Math.max(0, Math.min((prev[size] ?? 0) + delta, 9999)) }))

  const setSizeQty = (size: string, val: string) =>
    setSizeQtys(prev => ({ ...prev, [size]: Math.max(0, Math.min(parseInt(val) || 0, 9999)) }))

  const colorSelections = colors.filter(c => (colorQtys[c] ?? 0) > 0)
  const sizeSelections = sizes.filter(s => (sizeQtys[s] ?? 0) > 0)

  const handleAddToCart = () => {
    const base = { product_id: product.id, name: product.name, emoji: meta.emoji, bg: meta.bg, image: images[0] ?? undefined, price: product.price_cfa }
    if (colors.length > 0) {
      // une ligne par couleur, taille unique si applicable
      Object.entries(colorQtys).filter(([, q]) => q > 0).forEach(([color, qty]) => {
        addItem({ ...base, quantity: qty, color })
      })
    } else if (sizes.length > 0) {
      // une ligne par taille
      Object.entries(sizeQtys).filter(([, q]) => q > 0).forEach(([size, qty]) => {
        addItem({ ...base, quantity: qty, size })
      })
    } else {
      addItem({ ...base, quantity: colorQtys._ ?? 1 })
    }
    router.push('/panier')
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
        <Link href="/">Accueil</Link> ›{' '}
        <Link href="/catalogue">Catalogue</Link> ›{' '}
        <Link href={`/catalogue?categorie=${encodeURIComponent(product.category ?? '')}`}>{product.category}</Link> ›{' '}
        {product.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Galerie */}
        <div>
          <div style={{ aspectRatio: '1', background: meta.bg, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, marginBottom: 10, overflow: 'hidden', position: 'relative' }}>
            {images[activeImg]
              ? <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              : meta.emoji}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: 60, height: 60, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${activeImg === i ? 'var(--orange)' : 'transparent'}`, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid var(--orange)' }}>{meta.emoji}</div>
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <span className="product-badge badge-new" style={{ marginBottom: 8 }}>{product.category}</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{product.name}</h1>
          {product.description && (
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>{product.description}</p>
          )}
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>
            {fmt(product.price_cfa)} FCFA <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>/ pièce</span>
          </div>
          {product.price_cny && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>≈ {product.price_cny} CNY</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
            Frais de douane : fixés à l&apos;arrivée à Lomé · Délai estimé : 30 à 40 jours
          </div>

          {/* Couleurs & quantités */}
          {colors.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                Couleurs & quantités <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 12 }}>— choisissez plusieurs couleurs</span>
              </div>
              <QtyTable rows={colors} qtys={colorQtys} onChange={setColorQty} onDelta={changeColorQty} />
              {colorSelections.length > 0 && (
                <SelectionSummary entries={colorSelections.map(c => ({ label: c, qty: colorQtys[c] }))} total={colorTotal} price={totalPrice} />
              )}
            </>
          )}

          {/* Tailles & quantités (si pas de couleurs) */}
          {sizes.length > 0 && colors.length === 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                Tailles & quantités <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 12 }}>— choisissez plusieurs tailles</span>
              </div>
              <QtyTable rows={sizes} qtys={sizeQtys} onChange={setSizeQty} onDelta={changeSizeQty} />
              {sizeSelections.length > 0 && (
                <SelectionSummary entries={sizeSelections.map(s => ({ label: s, qty: sizeQtys[s] }))} total={sizeTotal} price={totalPrice} />
              )}
            </>
          )}

          {/* Pas de couleur ni taille — quantité simple */}
          {colors.length === 0 && sizes.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Quantité</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setColorQtys(p => ({ ...p, _: Math.max(1, (p._ ?? 1) - 1) }))} style={{ width: 36, height: 36, border: '1.5px solid var(--border-2)', borderRadius: 8, background: 'var(--white)', fontSize: 20, cursor: 'pointer', color: 'var(--text-2)' }}>−</button>
                <input type="number" min={1} max={9999} value={colorQtys._ ?? 1} onChange={e => setColorQtys(p => ({ ...p, _: Math.max(1, parseInt(e.target.value) || 1) }))} style={{ width: 64, height: 36, border: '1.5px solid var(--orange)', borderRadius: 8, textAlign: 'center', fontSize: 16, fontWeight: 700, background: 'var(--orange-light)', color: 'var(--orange-dark)', outline: 'none' }} />
                <button onClick={() => setColorQtys(p => ({ ...p, _: (p._ ?? 1) + 1 }))} style={{ width: 36, height: 36, border: '1.5px solid var(--border-2)', borderRadius: 8, background: 'var(--white)', fontSize: 20, cursor: 'pointer', color: 'var(--text-2)' }}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[{ icon: '🚚', label: 'Livraison Lomé & environs' }, { icon: '📍', label: 'Retrait au dépôt possible' }, { icon: '🔒', label: 'Paiement sécurisé' }].map(chip => (
              <div key={chip.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)' }}>{chip.icon} {chip.label}</div>
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
              ? `Ajouter au panier — ${fmt(colors.length > 0 ? totalPrice : (colorQtys._ ?? 1) * product.price_cfa)} FCFA`
              : 'Choisissez au moins 1 pièce'
            }
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>
            Frais de douane à régler à l&apos;arrivée
          </div>
        </div>
      </div>
    </div>
  )
}

function QtyTable({ rows, qtys, onChange, onDelta }: {
  rows: string[]
  qtys: Record<string, number>
  onChange: (key: string, val: string) => void
  onDelta: (key: string, delta: number) => void
}) {
  return (
    <div style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', background: 'var(--bg)', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)' }}>
        <span>Variante</span>
        <span style={{ textAlign: 'right' }}>Quantité</span>
      </div>
      {rows.map(r => {
        const qty = qtys[r] ?? 0
        return (
          <div key={r} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <button disabled={qty === 0} onClick={() => onDelta(r, -1)} style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: qty === 0 ? 'default' : 'pointer', opacity: qty === 0 ? .35 : 1, color: 'var(--text-2)', flexShrink: 0 }}>−</button>
              <input type="number" min={0} max={9999} value={qty === 0 ? '' : qty} placeholder="0" onChange={e => onChange(r, e.target.value)} style={{ width: 52, height: 28, border: `1.5px solid ${qty > 0 ? 'var(--orange)' : 'var(--border-2)'}`, borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 700, background: qty > 0 ? 'var(--orange-light)' : 'var(--white)', color: qty > 0 ? 'var(--orange-dark)' : 'var(--text-3)', outline: 'none' }} />
              <button onClick={() => onDelta(r, 1)} style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)', flexShrink: 0 }}>+</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SelectionSummary({ entries, total, price }: { entries: { label: string; qty: number }[]; total: number; price: number }) {
  return (
    <div style={{ background: 'var(--orange-light)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange-dark)', marginBottom: 6 }}>Votre sélection</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {entries.map(e => (
          <div key={e.label} style={{ background: 'var(--white)', border: '1px solid var(--border-2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{e.label} × {e.qty}</div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{total} pièce{total > 1 ? 's' : ''}</span>
        <strong style={{ color: 'var(--orange-dark)' }}>{fmt(price)} FCFA</strong>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 48, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Chargement…</div>}>
      <ProductPageInner />
    </Suspense>
  )
}
