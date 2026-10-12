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
  const [selectedSize, setSelectedSize] = useState('')
  const [colorQtys, setColorQtys] = useState<Record<string, number>>({})
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (!id) return
    getProductById(id).then(p => {
      setProduct(p)
      if (p?.sizes?.[0]) setSelectedSize(p.sizes[0])
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

  const totalQty = Object.values(colorQtys).reduce((a, b) => a + b, 0)
  const totalPrice = totalQty * product.price_cfa
  const meetsMin = totalQty >= 1

  const changeQty = (color: string, delta: number) => {
    setColorQtys(prev => {
      const cur = prev[color] ?? 0
      const next = Math.max(0, Math.min(cur + delta, 99))
      return { ...prev, [color]: next }
    })
  }

  const selections = colors.filter(c => (colorQtys[c] ?? 0) > 0)

  const handleAddToCart = () => {
    const colorSummary = selections.length > 0
      ? selections.map(c => `${c} ×${colorQtys[c]}`).join(', ')
      : ''
    addItem({
      product_id: product.id,
      name: product.name,
      emoji: meta.emoji,
      bg: meta.bg,
      image: images[0] ?? undefined,
      price: product.price_cfa,
      quantity: totalQty || 1,
      size: selectedSize || undefined,
      color: colorSummary || undefined,
    })
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

          {/* Tailles */}
          {sizes.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Taille</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{ padding: '6px 14px', border: `1.5px solid ${selectedSize === s ? 'var(--orange)' : 'var(--border-2)'}`, borderRadius: 6, fontSize: 13, cursor: 'pointer', background: selectedSize === s ? 'var(--orange-light)' : 'transparent', color: selectedSize === s ? 'var(--orange-dark)' : 'inherit' }}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Couleurs + quantités */}
          {colors.length > 0 ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                Couleurs & quantités <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 12 }}>— choisissez plusieurs couleurs</span>
              </div>
              <div style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', background: 'var(--bg)', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)' }}>
                  <span>Couleur</span>
                  <span style={{ textAlign: 'right' }}>Quantité</span>
                </div>
                {colors.map(c => {
                  const qty = colorQtys[c] ?? 0
                  return (
                    <div key={c} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <button disabled={qty === 0} onClick={() => changeQty(c, -1)} style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: qty === 0 ? 'default' : 'pointer', opacity: qty === 0 ? .35 : 1, color: 'var(--text-2)' }}>−</button>
                        <span style={{ minWidth: 26, textAlign: 'center', fontSize: 14, fontWeight: 600, color: qty === 0 ? 'var(--text-3)' : 'var(--text)' }}>{qty}</span>
                        <button onClick={() => changeQty(c, 1)} style={{ width: 28, height: 28, border: '1.5px solid var(--border-2)', borderRadius: 6, background: 'var(--white)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)' }}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selections.length > 0 && (
                <div style={{ background: 'var(--orange-light)', border: '1.5px solid var(--orange)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange-dark)', marginBottom: 6 }}>Votre sélection</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                    {selections.map(c => (
                      <div key={c} style={{ background: 'var(--white)', border: '1px solid var(--border-2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                        {c} × {colorQtys[c]}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{totalQty} pièce{totalQty > 1 ? 's' : ''}</span>
                    <strong style={{ color: 'var(--orange-dark)' }}>{fmt(totalPrice)} FCFA</strong>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Quantité</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setColorQtys(p => ({ ...p, _: Math.max(0, (p._ ?? 0) - 1) }))} style={{ width: 36, height: 36, border: '1.5px solid var(--border-2)', borderRadius: 8, background: 'var(--white)', fontSize: 20, cursor: 'pointer', color: 'var(--text-2)' }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{colorQtys._ ?? 1}</span>
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

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 48, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Chargement…</div>}>
      <ProductPageInner />
    </Suspense>
  )
}
