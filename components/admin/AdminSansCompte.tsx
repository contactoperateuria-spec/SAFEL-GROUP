'use client'
import { useEffect, useState, useRef } from 'react'
import { adminGetCycles, getProducts, adminCreateGuestOrder, adminGetOrders } from '@/lib/db'
import { generateCouponPDF, downloadPDF } from '@/lib/generateCoupon'


function fmt(n: number) { return n.toLocaleString('fr-FR') }

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  confirmed: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
}
const STATUS_LABEL: Record<string, string> = { pending: 'En attente', paid: 'Payé', confirmed: 'Confirmé' }

type LineItem = { productId: string; productName: string; quantity: number; color: string; size: string; unitPrice: number }
type PickedProduct = { id: string; name: string; price: number; color: string; size: string; quantity: number }

function ProductPickerModal({ products, onConfirm, onClose }: {
  products: any[]
  onConfirm: (p: PickedProduct) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const filtered = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : products.slice(0, 10)

  const handleSelect = (p: any) => {
    setSelected(p)
    const firstVariant = p.variants?.[0] ?? ''
    setColor(firstVariant || p.colors?.[0] ?? '')
    setSize(firstVariant ? '' : (p.pointures?.[0] ?? p.sizes?.[0] ?? ''))
    setQty(1)
    setImgIdx(0)
  }

  const handleConfirm = () => {
    if (!selected) return
    onConfirm({ id: selected.id, name: selected.name, price: selected.price_cfa, color, size, quantity: qty })
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Choisir un article</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: search + list */}
          <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                style={{ ...inp, fontSize: 12 }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.04)',
                    background: selected?.id === p.id ? 'rgba(232,114,12,.15)' : 'transparent',
                    borderLeft: selected?.id === p.id ? '3px solid var(--orange)' : '3px solid transparent',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: selected?.id === p.id ? '#fff' : 'rgba(255,255,255,.75)', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>{fmt(p.price_cfa)} FCFA</div>
                  {p.category && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{p.category}</div>}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: 16, fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>Aucun résultat</div>
              )}
            </div>
          </div>

          {/* Right: product detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {!selected ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13, textAlign: 'center' }}>
                Sélectionne un article à gauche
              </div>
            ) : (
              <div>
                {/* Images */}
                {selected.images?.length > 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <img
                      src={selected.images[imgIdx]}
                      alt={selected.name}
                      style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,.04)' }}
                    />
                    {selected.images.length > 1 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {selected.images.map((img: string, i: number) => (
                          <img
                            key={i}
                            src={img}
                            onClick={() => setImgIdx(i)}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: imgIdx === i ? '2px solid var(--orange)' : '2px solid transparent', opacity: imgIdx === i ? 1 : .6 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.04)', borderRadius: 8, marginBottom: 14, fontSize: 32 }}>
                    📦
                  </div>
                )}

                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selected.name}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--orange)', marginBottom: 12 }}>{fmt(selected.price_cfa)} FCFA</div>

                {selected.description && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 14 }}>{selected.description}</div>
                )}

                {/* Variantes (combinées) */}
                {selected.variants?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Variante</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.variants.map((v: string) => (
                        <button
                          key={v}
                          onClick={() => setColor(v)}
                          style={{
                            padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                            background: color === v ? 'var(--orange)' : 'rgba(255,255,255,.07)',
                            border: color === v ? '1px solid var(--orange)' : '1px solid rgba(255,255,255,.12)',
                            color: color === v ? '#fff' : 'rgba(255,255,255,.65)',
                          }}
                        >{v}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Couleurs (anciens produits sans variantes) */}
                {!selected.variants?.length && selected.colors?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Couleur</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selected.colors.map((c: string) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          style={{
                            padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                            background: color === c ? 'var(--orange)' : 'rgba(255,255,255,.07)',
                            border: color === c ? '1px solid var(--orange)' : '1px solid rgba(255,255,255,.12)',
                            color: color === c ? '#fff' : 'rgba(255,255,255,.65)',
                          }}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantité */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Quantité</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: 4, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={qty}
                      onChange={e => setQty(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
                      style={{ ...inp, width: 80, textAlign: 'center' }}
                    />
                    <button onClick={() => setQty(q => Math.min(9999, q + 1))} style={{ width: 32, height: 32, borderRadius: 4, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
                  </div>
                </div>

                {/* Total ligne */}
                <div style={{ background: 'rgba(232,114,12,.08)', border: '1px solid rgba(232,114,12,.2)', borderRadius: 6, padding: '8px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Sous-total</span>
                  <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{fmt(selected.price_cfa * qty)} FCFA</span>
                </div>

                <button
                  onClick={handleConfirm}
                  style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}
                >
                  Confirmer la sélection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminSansCompte() {
  const [tab, setTab] = useState<'nouveau' | 'historique'>('nouveau')
  const [cycles, setCycles] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [guestOrders, setGuestOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ name: '', phone: '', phoneConfirm: '', cycleId: '' })
  const [items, setItems] = useState<LineItem[]>([{ productId: '', productName: '', quantity: 1, color: '', size: '', unitPrice: 0 }])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([adminGetCycles(), getProducts(), adminGetOrders()]).then(([cy, pr, ord]) => {
      setCycles(cy.filter((c: any) => c.status === 'open' || c.status === 'closed'))
      setProducts(pr)
      setGuestOrders(ord.filter((o: any) => o.is_guest))
      setLoading(false)
    })
  }, [])

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const handlePick = (idx: number, p: PickedProduct) => {
    setItems(prev => {
      const next = [...prev]
      next[idx] = { productId: p.id, productName: p.name, unitPrice: p.price, quantity: p.quantity, color: p.color, size: p.size }
      return next
    })
    setPickerIdx(null)
  }

  const handleDownloadPDF = async (o: any) => {
    setDownloadingPdf(o.id)
    try {
      const items = (o.order_items ?? []).map((i: any) => ({
        name: i.products?.name ?? 'Produit',
        qty: i.quantity,
        unitPrice: i.unit_price_cfa ?? 0,
        color: i.color || undefined,
        imageUrl: i.products?.images?.[0] ?? undefined,
      }))
      const pdfBytes = await generateCouponPDF({
        reference: o.reference ?? o.id.slice(0, 8).toUpperCase(),
        customerName: o.customer_name ?? '',
        customerPhone: o.customer_phone ?? '',
        items,
        totalMarchandises: o.total_cfa ?? 0,
        fraisDouane: 0,
        cycle: o.cycles?.name ?? '',
        date: new Date(o.created_at).toLocaleDateString('fr-FR'),
      })
      downloadPDF(pdfBytes, `recu-${o.reference ?? o.id.slice(0, 8)}.pdf`)
    } catch { /* silencieux */ }
    setDownloadingPdf(null)
  }

  const addItem = () => setItems(prev => [...prev, { productId: '', productName: '', quantity: 1, color: '', size: '', unitPrice: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    setSaveError('')
    if (!form.name || !form.phone || !form.cycleId) {
      setSaveError('Merci de renseigner le nom, le téléphone et le cycle.')
      return
    }
    if (form.phone !== form.phoneConfirm) {
      setSaveError('Les numéros de téléphone ne correspondent pas.')
      return
    }
    const validItems = items.filter(i => i.productId && i.quantity > 0)
    if (!validItems.length) {
      setSaveError('Ajoutez au moins un article valide.')
      return
    }
    setSaving(true)
    const order = await adminCreateGuestOrder({
      cycle_id: form.cycleId,
      customer_name: form.name,
      customer_phone: form.phone,
      items: validItems.map(i => ({ product_id: i.productId, quantity: i.quantity, unit_price: i.unitPrice, color: i.color || undefined, size: i.size || undefined })),
      total_amount: total,
    })
    if (order) {
      setSaved(true)
      setGuestOrders(prev => [order, ...prev])

      // Télécharger le reçu PDF automatiquement avec miniatures
      try {
        const cycleName = cycles.find(c => c.id === form.cycleId)?.name ?? ''
        const pdfBytes = await generateCouponPDF({
          reference: order.reference ?? '',
          customerName: form.name,
          customerPhone: form.phone,
          items: validItems.map(i => {
            const prod = products.find((p: any) => p.id === i.productId)
            return {
              name: i.productName,
              qty: i.quantity,
              unitPrice: i.unitPrice,
              color: i.color || undefined,
              imageUrl: prod?.images?.[0] ?? undefined,
            }
          }),
          totalMarchandises: total,
          fraisDouane: 0,
          cycle: cycleName,
          date: new Date().toLocaleDateString('fr-FR'),
        })
        downloadPDF(pdfBytes, `recu-${order.reference ?? 'commande'}.pdf`)
      } catch { /* silencieux si PDF échoue */ }

      setForm({ name: '', phone: '', phoneConfirm: '', cycleId: '' })
      setItems([{ productId: '', productName: '', quantity: 1, color: '', size: '', unitPrice: 0 }])
      setSaveError('')
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div>
      {pickerIdx !== null && (
        <ProductPickerModal
          products={products}
          onConfirm={p => handlePick(pickerIdx, p)}
          onClose={() => setPickerIdx(null)}
        />
      )}

      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Commandes sans compte</div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: 3 }}>
        {(['nouveau', 'historique'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, border: 'none', borderRadius: 4, padding: '6px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,.45)' }}>
            {t === 'nouveau' ? '+ Nouvelle commande' : 'Historique'}
          </button>
        ))}
      </div>

      {tab === 'nouveau' && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'rgba(255,255,255,.85)' }}>Créer une commande manuelle</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Nom du client</div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Prénom Nom" style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Téléphone</div>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+228 XX XX XX XX" style={inp} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Confirmer le téléphone</div>
              <input
                value={form.phoneConfirm}
                onChange={e => setForm(p => ({ ...p, phoneConfirm: e.target.value }))}
                placeholder="+228 XX XX XX XX"
                style={{
                  ...inp,
                  borderColor: form.phoneConfirm
                    ? form.phone === form.phoneConfirm ? 'rgba(74,222,128,.5)' : 'rgba(239,68,68,.5)'
                    : 'rgba(255,255,255,.12)',
                }}
              />
              {form.phoneConfirm && form.phone !== form.phoneConfirm && (
                <div style={{ fontSize: 10, color: '#F87171', marginTop: 3 }}>Les numéros ne correspondent pas</div>
              )}
              {form.phoneConfirm && form.phone === form.phoneConfirm && (
                <div style={{ fontSize: 10, color: '#4ADE80', marginTop: 3 }}>✓ Numéros identiques</div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Cycle</div>
            <select value={form.cycleId} onChange={e => setForm(p => ({ ...p, cycleId: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">Sélectionner un cycle…</option>
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase' }}>Articles</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Article {idx + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>×</button>
                  )}
                </div>

                {item.productId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{item.productName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                        {item.color && <span>{item.color} · </span>}
                        {item.size && <span>{item.size} · </span>}
                        {item.quantity} × {fmt(item.unitPrice)} FCFA
                        <span style={{ color: 'var(--orange)', fontWeight: 600, marginLeft: 6 }}>{fmt(item.unitPrice * item.quantity)} FCFA</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPickerIdx(idx)}
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickerIdx(idx)}
                    style={{ background: 'rgba(232,114,12,.1)', border: '1px dashed rgba(232,114,12,.4)', color: 'var(--orange)', borderRadius: 4, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}
                  >
                    + Choisir un article
                  </button>
                )}
              </div>
            ))}
            <button onClick={addItem} style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.45)', borderRadius: 4, padding: '5px 12px', fontSize: 11, cursor: 'pointer', width: '100%' }}>+ Ajouter un article</button>
          </div>

          {total > 0 && (
            <div style={{ background: 'rgba(232,114,12,.08)', border: '1px solid rgba(232,114,12,.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Total calculé</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>{fmt(total)} FCFA</span>
            </div>
          )}

          {saveError && (
            <div style={{ fontSize: 11, color: '#F87171', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 4, padding: '7px 10px', marginBottom: 8 }}>
              ⚠ {saveError}
            </div>
          )}
          <button onClick={handleSave} disabled={saving || loading} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: saving ? .5 : 1 }}>
            {saved ? '✅ Commande enregistrée' : saving ? 'Enregistrement…' : 'Enregistrer la commande'}
          </button>
        </div>
      )}

      {tab === 'historique' && (
        loading ? (
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr auto', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>Réf.</span><span>Client</span><span>Montant</span><span>Statut</span><span></span>
            </div>
            {guestOrders.map(o => (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr auto', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, color: 'rgba(255,255,255,.7)', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{o.reference ?? '—'}</span>
                <span>
                  <div>{o.customer_name}</div>
                  <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
                </span>
                <span>{fmt(o.total_cfa ?? 0)} FCFA</span>
                <span><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, ...(STATUS_STYLE[o.status] ?? {}) }}>{STATUS_LABEL[o.status] ?? o.status}</span></span>
                <button
                  onClick={() => handleDownloadPDF(o)}
                  disabled={downloadingPdf === o.id}
                  style={{ background: 'rgba(147,197,253,.1)', border: '1px solid rgba(147,197,253,.25)', color: '#93C5FD', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: downloadingPdf === o.id ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: downloadingPdf === o.id ? .5 : 1 }}
                >
                  {downloadingPdf === o.id ? '…' : '↓ PDF'}
                </button>
              </div>
            ))}
            {guestOrders.length === 0 && (
              <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucune commande sans compte</div>
            )}
          </div>
        )
      )}
    </div>
  )
}
