'use client'
import { useState, useEffect, useRef } from 'react'
import { adminGetProducts, adminGetDraftProducts, adminCreateProduct, adminArchiveProduct, adminUpdateProduct, uploadProductImage, adminLogActivity } from '@/lib/db'
import type { Product } from '@/lib/types'
import { toDisplayProduct } from '@/lib/displayHelpers'

const CATEGORIES = ['Beauté', 'Électronique', 'Mode Femme', 'Mode Homme', 'Maison & Cuisine', 'Accessoires', 'Jouets', 'Sport & Fitness', 'Bébé & Enfant', 'Informatique', 'Santé & Bien-être', 'Auto & Moto', 'Divers']

const EMPTY_FORM = {
  name: '', description: '', price_cfa: '', price_cny: '', category: 'Beauté',
  colors: [] as string[], colorInput: '',
  sizes: [] as string[], sizeInput: '',
  pointures: [] as string[], pointureInput: '',
  stock: '10', is_active: true, is_draft: false, customs_fee_cfa: '0',
}

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function AdminProduits() {
  const [products, setProducts] = useState<Product[]>([])
  const [drafts, setDrafts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    Promise.all([adminGetProducts(), adminGetDraftProducts()])
      .then(([active, draft]) => { setProducts(active); setDrafts(draft); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const addColor = () => {
    const val = form.colorInput.trim()
    if (!val || form.colors.includes(val)) { setForm(p => ({ ...p, colorInput: '' })); return }
    setForm(p => ({ ...p, colors: [...p.colors, val], colorInput: '' }))
  }

  const removeColor = (c: string) => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))

  const addSize = () => {
    const val = form.sizeInput.trim().toUpperCase()
    if (!val || form.sizes.includes(val)) { setForm(p => ({ ...p, sizeInput: '' })); return }
    setForm(p => ({ ...p, sizes: [...p.sizes, val], sizeInput: '' }))
  }

  const removeSize = (s: string) => setForm(p => ({ ...p, sizes: p.sizes.filter(x => x !== s) }))

  const addPointure = () => {
    const val = form.pointureInput.trim()
    if (!val || form.pointures.includes(val)) { setForm(p => ({ ...p, pointureInput: '' })); return }
    setForm(p => ({ ...p, pointures: [...p.pointures, val], pointureInput: '' }))
  }

  const removePointure = (pt: string) => setForm(p => ({ ...p, pointures: p.pointures.filter(x => x !== pt) }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price_cfa) {
      setFeedback({ type: 'err', msg: 'Nom et prix sont obligatoires.' })
      return
    }
    setSaving(true)
    let imageUrl: string | null = null
    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile)
      if (!imageUrl) {
        setFeedback({ type: 'err', msg: 'Erreur upload image. Vérifiez le fichier.' })
        setSaving(false)
        return
      }
    }
    const result = await adminCreateProduct({
      name: form.name.trim(),
      description: form.description.trim(),
      price_cfa: parseInt(form.price_cfa) || 0,
      price_cny: form.price_cny ? parseFloat(form.price_cny) : null,
      category: form.category,
      colors: form.colors,
      sizes: form.sizes,
      pointures: form.pointures,
      stock: parseInt(form.stock) || 0,
      is_active: form.is_draft ? false : form.is_active,
      is_draft: form.is_draft,
      customs_fee_cfa: parseInt(form.customs_fee_cfa) || 0,
      images: imageUrl ? [imageUrl] : [],
    })
    setSaving(false)
    if (result) {
      adminLogActivity('create', 'products', result.id, {
        message: form.is_draft
          ? `Brouillon créé : "${result.name}" — en attente d'activation`
          : `Produit créé : "${result.name}" — ${(result.price_cfa ?? 0).toLocaleString('fr-FR')} FCFA`,
        name: result.name, price_cfa: result.price_cfa, is_draft: form.is_draft,
      })
      setFeedback({ type: 'ok', msg: form.is_draft ? `⏳ "${result.name}" enregistré en brouillon.` : `✅ "${result.name}" ajouté au catalogue.` })
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview(null)
      setShowForm(false)
      load()
    } else {
      setFeedback({ type: 'err', msg: 'Erreur lors de l\'ajout. Vérifiez les champs.' })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price_cfa: String(p.price_cfa),
      price_cny: p.price_cny != null ? String(p.price_cny) : '',
      category: p.category ?? 'Beauté',
      colors: p.colors ?? [],
      colorInput: '',
      sizes: p.sizes ?? [],
      sizeInput: '',
      pointures: p.pointures ?? [],
      pointureInput: '',
      stock: String(p.stock ?? 0),
      is_active: p.is_active ?? true,
      is_draft: p.is_draft ?? false,
      customs_fee_cfa: String(p.customs_fee_cfa ?? 0),
    })
    setImageFile(null)
    setImagePreview(p.images?.[0] ?? null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdate = async () => {
    if (!editingProduct) return
    if (!form.name.trim() || !form.price_cfa) {
      setFeedback({ type: 'err', msg: 'Nom et prix sont obligatoires.' })
      return
    }
    setSaving(true)
    let images = editingProduct.images ?? []
    if (imageFile) {
      const url = await uploadProductImage(imageFile)
      if (!url) {
        setFeedback({ type: 'err', msg: 'Erreur upload image.' })
        setSaving(false)
        return
      }
      images = [url]
    }
    const ok = await adminUpdateProduct(editingProduct.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      price_cfa: parseInt(form.price_cfa) || 0,
      price_cny: form.price_cny ? parseFloat(form.price_cny) : null,
      category: form.category,
      colors: form.colors,
      sizes: form.sizes,
      pointures: form.pointures,
      stock: parseInt(form.stock) || 0,
      is_active: form.is_active,
      customs_fee_cfa: parseInt(form.customs_fee_cfa) || 0,
      images,
    })
    setSaving(false)
    if (ok) {
      adminLogActivity('update', 'products', editingProduct.id, {
        message: `Produit modifié : "${form.name}" — ${(parseInt(form.price_cfa) || 0).toLocaleString('fr-FR')} FCFA`,
        name: form.name, price_cfa: parseInt(form.price_cfa) || 0,
      })
      setFeedback({ type: 'ok', msg: `✅ "${form.name}" mis à jour.` })
      setEditingProduct(null)
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview(null)
      setShowForm(false)
      load()
    } else {
      setFeedback({ type: 'err', msg: 'Erreur lors de la mise à jour.' })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archiver "${name}" ? Il ne sera plus visible dans le catalogue.`)) return
    await adminArchiveProduct(id)
    adminLogActivity('delete', 'products', id, {
      message: `Produit archivé : "${name}"`,
      name,
    })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Produits ({products.length})</div>
        <button onClick={() => { setShowForm(v => !v); setEditingProduct(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null) }} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? '✕ Annuler' : '+ Ajouter un produit'}
        </button>
      </div>

      {feedback && (
        <div style={{ background: feedback.type === 'ok' ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${feedback.type === 'ok' ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`, color: feedback.type === 'ok' ? '#4ADE80' : '#F87171', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>
          {feedback.msg}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(232,114,12,.3)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'rgba(255,255,255,.9)' }}>{editingProduct ? `Modifier : ${editingProduct.name}` : 'Nouveau produit'}</div>

          {/* Upload photo */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Photo du produit</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed rgba(232,114,12,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.03)' }}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28 }}>📷</span>
                }
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(232,114,12,.15)', border: '1px solid rgba(232,114,12,.3)', color: 'var(--orange)', borderRadius: 4, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  {imageFile ? 'Changer la photo' : 'Choisir une photo'}
                </button>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>JPG, PNG, WebP · Max 5 Mo</div>
                {imageFile && <div style={{ fontSize: 10, color: '#4ADE80', marginTop: 2 }}>✓ {imageFile.name}</div>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          </div>

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
            <Field label="Couleurs disponibles">
              <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, padding: '6px 8px', background: 'rgba(255,255,255,.08)', minHeight: 38 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: form.colors.length > 0 ? 6 : 0 }}>
                  {form.colors.map(c => (
                    <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(232,114,12,.18)', border: '1px solid rgba(232,114,12,.4)', color: 'var(--orange)', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {c}
                      <button type="button" onClick={() => removeColor(c)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, opacity: .7 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    value={form.colorInput}
                    onChange={set('colorInput')}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor() } }}
                    placeholder="Ex : Rouge, Noir…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, padding: '2px 0' }}
                  />
                  <button type="button" onClick={addColor} style={{ background: 'rgba(232,114,12,.2)', border: '1px solid rgba(232,114,12,.4)', color: 'var(--orange)', borderRadius: 4, padding: '2px 8px', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>+</button>
                </div>
              </div>
            </Field>
            <Field label="Tailles disponibles">
              <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, padding: '6px 8px', background: 'rgba(255,255,255,.08)', minHeight: 38 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: form.sizes.length > 0 ? 6 : 0 }}>
                  {form.sizes.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(99,102,241,.18)', border: '1px solid rgba(99,102,241,.4)', color: '#818CF8', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {s}
                      <button type="button" onClick={() => removeSize(s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, opacity: .7 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    value={form.sizeInput}
                    onChange={set('sizeInput')}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSize() } }}
                    placeholder="Ex : S, M, L, XL…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, padding: '2px 0' }}
                  />
                  <button type="button" onClick={addSize} style={{ background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)', color: '#818CF8', borderRadius: 4, padding: '2px 8px', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>+</button>
                </div>
              </div>
            </Field>
            <Field label="Pointures disponibles">
              <div style={{ border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, padding: '6px 8px', background: 'rgba(255,255,255,.08)', minHeight: 38 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: form.pointures.length > 0 ? 6 : 0 }}>
                  {form.pointures.map(pt => (
                    <span key={pt} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(20,184,166,.18)', border: '1px solid rgba(20,184,166,.4)', color: '#2DD4BF', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {pt}
                      <button type="button" onClick={() => removePointure(pt)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, opacity: .7 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    value={form.pointureInput}
                    onChange={set('pointureInput')}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPointure() } }}
                    placeholder="Ex : 38, 39, 40, 41…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, padding: '2px 0' }}
                  />
                  <button type="button" onClick={addPointure} style={{ background: 'rgba(20,184,166,.2)', border: '1px solid rgba(20,184,166,.4)', color: '#2DD4BF', borderRadius: 4, padding: '2px 8px', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}>+</button>
                </div>
              </div>
            </Field>
            <Field label="Stock initial">
              <input type="number" value={form.stock} onChange={set('stock')} placeholder="10" style={inp} />
            </Field>
            <Field label="Frais de douane / unité (FCFA)">
              <input type="number" value={form.customs_fee_cfa} onChange={set('customs_fee_cfa')} placeholder="0" style={inp} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} placeholder="Description du produit…" rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', height: 'auto' }} />
          </Field>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {!editingProduct && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: form.is_draft ? '#C084FC' : 'rgba(255,255,255,.6)', cursor: 'pointer', background: form.is_draft ? 'rgba(192,132,252,.08)' : 'transparent', border: `1px solid ${form.is_draft ? 'rgba(192,132,252,.3)' : 'transparent'}`, borderRadius: 6, padding: '5px 10px', transition: 'all .15s' }}>
                <input type="checkbox" checked={form.is_draft} onChange={e => setForm(p => ({ ...p, is_draft: e.target.checked }))} style={{ accentColor: '#C084FC' }} />
                ⏳ Brouillon — activer au prochain cycle
              </label>
            )}
            <button onClick={editingProduct ? handleUpdate : handleSave} disabled={saving} style={{ marginLeft: 'auto', background: form.is_draft ? 'rgba(192,132,252,.8)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? (imageFile ? 'Upload en cours…' : 'Enregistrement…') : editingProduct ? 'Enregistrer les modifications' : form.is_draft ? 'Enregistrer en brouillon' : 'Ajouter au catalogue'}
            </button>
          </div>
        </div>
      )}

      {/* Section brouillons */}
      {!loading && drafts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C084FC' }}>⏳ Brouillons ({drafts.length})</span>
            <span style={{ fontSize: 11, color: 'rgba(192,132,252,.6)' }}>— s&apos;activeront à la fermeture du cycle en cours</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {drafts.map(p => {
              const d = toDisplayProduct(p)
              const img = p.images?.[0]
              return (
                <div key={p.id} style={{ background: 'rgba(192,132,252,.05)', border: '1px solid rgba(192,132,252,.2)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
                    {img ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : d.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{p.category} · {fmt(p.price_cfa)} FCFA</div>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(192,132,252,.15)', color: '#C084FC', fontWeight: 600 }}>Brouillon</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button onClick={() => openEdit(p)} style={{ border: '1px solid rgba(232,114,12,.4)', color: 'var(--orange)', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'rgba(232,114,12,.08)', fontWeight: 600 }}>Éditer</button>
                    <button onClick={() => adminUpdateProduct(p.id, { is_active: true, is_draft: false }).then(load)} style={{ border: '1px solid rgba(74,222,128,.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'transparent' }}>Activer</button>
                    <button onClick={() => { if (confirm(`Supprimer le brouillon "${p.name}" ?`)) adminUpdateProduct(p.id, { is_active: false, is_draft: false }).then(load) }} style={{ border: '1px solid rgba(239,68,68,.3)', color: '#F87171', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'transparent' }}>Retirer</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
            const img = p.images?.[0]
            return (
              <div key={p.id} style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${p.is_active ? 'rgba(255,255,255,.1)' : 'rgba(239,68,68,.2)'}`, borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 10, alignItems: 'center', opacity: p.is_active ? 1 : .6 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, overflow: 'hidden' }}>
                  {img ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : d.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{p.category} · {fmt(p.price_cfa)} FCFA</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600, ...(p.is_active ? { background: 'rgba(74,222,128,.15)', color: '#4ADE80' } : { background: 'rgba(239,68,68,.15)', color: '#F87171' }) }}>{p.is_active ? 'Actif' : 'Archivé'}</span>
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.45)' }}>Stock : {p.stock}</span>
                    {!img && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(232,114,12,.1)', color: 'rgba(232,114,12,.7)' }}>Sans photo</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button onClick={() => openEdit(p)} style={{ border: '1px solid rgba(232,114,12,.4)', color: 'var(--orange)', padding: '4px 8px', borderRadius: 4, fontSize: 9, cursor: 'pointer', background: 'rgba(232,114,12,.08)', whiteSpace: 'nowrap', fontWeight: 600 }}>Éditer</button>
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

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}
