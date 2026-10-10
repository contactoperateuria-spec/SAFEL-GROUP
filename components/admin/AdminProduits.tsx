'use client'
import { useState, useEffect } from 'react'
import { adminGetProducts, adminCreateProduct, adminArchiveProduct } from '@/lib/db'
import type { Product } from '@/lib/types'
import { toDisplayProduct } from '@/lib/displayHelpers'

const CATEGORIES = ['Beauté', 'Électronique', 'Mode Femme', 'Mode Homme', 'Maison & Cuisine', 'Accessoires', 'Jouets']

const EMPTY_FORM = {
  name: '', description: '', price_cfa: '', price_cny: '', category: 'Beauté',
  colors: '', sizes: '', stock: '10', is_active: true,
}

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function AdminProduits() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const load = () => {
    setLoading(true)
    adminGetProducts().then(data => { setProducts(data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.price_cfa) {
      setFeedback({ type: 'err', msg: 'Nom et prix sont obligatoires.' })
      return
    }
    setSaving(true)
    const result = await adminCreateProduct({
      name: form.name.trim(),
      description: form.description.trim(),
      price_cfa: parseInt(form.price_cfa) || 0,
      price_cny: form.price_cny ? parseFloat(form.price_cny) : null,
      category: form.category,
      colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      stock: parseInt(form.stock) || 0,
      is_active: form.is_active,
    })
    setSaving(false)
    if (result) {
      setFeedback({ type: 'ok', msg: `✅ "${result.name}" ajouté au catalogue.` })
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } else {
      setFeedback({ type: 'err', msg: 'Erreur lors de l\'ajout. Vérifiez les champs.' })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archiver "${name}" ? Il ne sera plus visible dans le catalogue.`)) return
    await adminArchiveProduct(id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Produits ({products.length})</div>
        <button onClick={() => setShowForm(v => !v)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? '✕ Annuler' : '+ Ajouter un produit'}
        </button>
      </div>

      {feedback && (
        <div style={{ background: feedback.type === 'ok' ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${feedback.type === 'ok' ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`, color: feedback.type === 'ok' ? '#4ADE80' : '#F87171', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>
          {feedback.msg}
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(232,114,12,.3)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'rgba(255,255,255,.9)' }}>Nouveau produit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Nom du produit *">
              <input value={form.name} onChange={set('name')} placeholder="Ex : Sérum Vitamine C 30ml" style={inp} />
            </Field>
            <Field label="Catégorie">
              <select value={form.category} onChange={set('category')} style={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Prix (FCFA) *">
              <input type="number" value={form.price_cfa} onChange={set('price_cfa')} placeholder="4500" style={inp} />
            </Field>
            <Field label="Prix (CNY) — optionnel">
              <input type="number" value={form.price_cny} onChange={set('price_cny')} placeholder="22" style={inp} />
            </Field>
            <Field label="Couleurs disponibles (virgule)">
              <input value={form.colors} onChange={set('colors')} placeholder="Beige, Blanc, Noir, Rose" style={inp} />
            </Field>
            <Field label="Tailles disponibles (virgule)">
              <input value={form.sizes} onChange={set('sizes')} placeholder="S, M, L, XL" style={inp} />
            </Field>
            <Field label="Stock initial">
              <input type="number" value={form.stock} onChange={set('stock')} placeholder="10" style={inp} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} placeholder="Description du produit…" rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', height: 'auto' }} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
              Visible dans le catalogue immédiatement
            </label>
            <button onClick={handleSave} disabled={saving} style={{ marginLeft: 'auto', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? 'Enregistrement…' : 'Ajouter au catalogue'}
            </button>
          </div>
        </div>
      )}

      {/* Liste produits */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Chargement…</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Aucun produit. Ajoutez votre premier produit ci-dessus.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {products.map(p => {
            const d = toDisplayProduct(p)
            return (
              <div key={p.id} style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${p.is_active ? 'rgba(255,255,255,.1)' : 'rgba(239,68,68,.2)'}`, borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 10, alignItems: 'center', opacity: p.is_active ? 1 : .6 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{d.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{p.category} · {fmt(p.price_cfa)} FCFA</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600, ...(p.is_active ? { background: 'rgba(74,222,128,.15)', color: '#4ADE80' } : { background: 'rgba(239,68,68,.15)', color: '#F87171' }) }}>{p.is_active ? 'Actif' : 'Archivé'}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.45)' }}>Stock : {p.stock}</span>
                    {p.colors.length > 0 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.45)' }}>{p.colors.length} couleur{p.colors.length > 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.is_active && (
                    <button onClick={() => handleArchive(p.id, p.name)} style={{ border: '1px solid rgba(239,68,68,.3)', color: '#F87171', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'transparent', whiteSpace: 'nowrap' }}>Archiver</button>
                  )}
                  {!p.is_active && (
                    <button onClick={() => adminUpdateProduct(p.id, { is_active: true }).then(load)} style={{ border: '1px solid rgba(74,222,128,.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'transparent', whiteSpace: 'nowrap' }}>Réactiver</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {children}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adminUpdateProduct(id: string, updates: any) {
  return import('@/lib/db').then(m => m.adminUpdateProduct(id, updates))
}

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}
