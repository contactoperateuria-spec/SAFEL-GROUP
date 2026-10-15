'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getProducts } from '@/lib/db'
import { toDisplayProduct, DEMO_PRODUCTS, type DisplayProduct } from '@/lib/displayHelpers'

const CATEGORIES = ['Toutes catégories', 'Beauté', 'Électronique', 'Mode Femme', 'Mode Homme', 'Maison & Cuisine', 'Accessoires', 'Jouets', 'Sport & Fitness', 'Bébé & Enfant', 'Informatique', 'Santé & Bien-être', 'Auto & Moto', 'Divers']
const TRIS = ['Pertinence', 'Prix croissant', 'Prix décroissant', 'Nouveautés']

function fmt(n: number) { return n.toLocaleString('fr-FR') }

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 180, background: '#F0F0F0' }} />
      <div style={{ padding: 12 }}>
        <div style={{ height: 14, background: '#E8E8E8', borderRadius: 4, marginBottom: 8, width: '80%' }} />
        <div style={{ height: 16, background: '#E8E8E8', borderRadius: 4, width: '50%' }} />
      </div>
    </div>
  )
}

function CatalogueContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('Toutes catégories')
  const [tri, setTri] = useState('Pertinence')
  const [vue, setVue] = useState<'grid' | 'list'>('grid')

  const [allProducts, setAllProducts] = useState<DisplayProduct[]>([])

  useEffect(() => {
    const cat = searchParams.get('categorie')
    if (cat) setCategorie(cat)
  }, [searchParams])

  useEffect(() => {
    getProducts().then(data => {
      const list = data.length > 0 ? data.map(toDisplayProduct) : DEMO_PRODUCTS
      setAllProducts(list)
      setLoading(false)
    }).catch(() => {
      setAllProducts(DEMO_PRODUCTS)
      setLoading(false)
    })
  }, [])

  let displayed = allProducts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categorie === 'Toutes catégories' || p.category === categorie
    return matchSearch && matchCat
  })
  if (tri === 'Prix croissant') displayed = [...displayed].sort((a, b) => a.price - b.price)
  if (tri === 'Prix décroissant') displayed = [...displayed].sort((a, b) => b.price - a.price)

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher dans le catalogue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, border: '1.5px solid var(--border-2)', borderRadius: 20, padding: '0 12px 0 36px', fontSize: 14, outline: 'none', background: 'var(--white)' }}
          />
        </div>
        <select value={categorie} onChange={e => setCategorie(e.target.value)} style={{ height: 40, border: '1.5px solid var(--border-2)', borderRadius: 20, padding: '0 14px', fontSize: 13, background: 'var(--white)', color: 'var(--text-2)', outline: 'none' }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={tri} onChange={e => setTri(e.target.value)} style={{ height: 40, border: '1.5px solid var(--border-2)', borderRadius: 20, padding: '0 14px', fontSize: 13, background: 'var(--white)', color: 'var(--text-2)', outline: 'none' }}>
          {TRIS.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setVue('grid')} style={{ width: 38, height: 38, border: `1.5px solid ${vue === 'grid' ? 'var(--orange)' : 'var(--border-2)'}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: vue === 'grid' ? 'var(--orange-light)' : 'var(--white)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={vue === 'grid' ? 'var(--orange-dark)' : 'currentColor'} strokeWidth="2" width="16" height="16">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button onClick={() => setVue('list')} style={{ width: 38, height: 38, border: `1.5px solid ${vue === 'list' ? 'var(--orange)' : 'var(--border-2)'}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: vue === 'list' ? 'var(--orange-light)' : 'var(--white)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={vue === 'list' ? 'var(--orange-dark)' : 'currentColor'} strokeWidth="2" width="16" height="16">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        {loading ? 'Chargement…' : `${displayed.length} article${displayed.length > 1 ? 's' : ''} · Cycle Octobre 2025`}
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aucun résultat</div>
          <div style={{ fontSize: 14 }}>Essayez un autre mot-clé ou catégorie</div>
        </div>
      ) : vue === 'grid' ? (
        <div className="product-grid">
          {displayed.map(p => (
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
                <div className="product-card-moq">Min. {p.moq} pc{p.moq > 1 ? 's' : ''} · Livraison estimée : 30-40 jours</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map(p => (
            <Link href={`/catalogue/${p.id}`} key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : p.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {p.badge && <span className={`product-badge ${p.badgeClass}`}>{p.badge}</span>}
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{p.category} · Min. {p.moq} pc{p.moq > 1 ? 's' : ''} · Livraison 30-40 jours</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)', flexShrink: 0 }}>{fmt(p.price)} FCFA</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 32, color: 'var(--text-3)', fontSize: 13 }}>Chargement…</div>}>
      <CatalogueContent />
    </Suspense>
  )
}
