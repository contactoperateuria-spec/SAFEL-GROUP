'use client'
import { useEffect, useState } from 'react'
import { adminGetCycles, getProducts, adminCreateGuestOrder, adminGetOrders } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  confirmed: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
}
const STATUS_LABEL: Record<string, string> = { pending: 'En attente', paid: 'Payé', confirmed: 'Confirmé' }

type LineItem = { productId: string; quantity: number; color: string; unitPrice: number }

export default function AdminSansCompte() {
  const [tab, setTab] = useState<'nouveau' | 'historique'>('nouveau')
  const [cycles, setCycles] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [guestOrders, setGuestOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ name: '', phone: '', cycleId: '' })
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1, color: '', unitPrice: 0 }])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([adminGetCycles(), getProducts(), adminGetOrders()]).then(([cy, pr, ord]) => {
      setCycles(cy.filter((c: any) => c.status === 'open' || c.status === 'closed'))
      setProducts(pr)
      setGuestOrders(ord.filter((o: any) => o.is_guest))
      setLoading(false)
    })
  }, [])

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const setItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev]
      if (field === 'productId') {
        const prod = products.find((p: any) => p.id === value)
        next[idx] = { ...next[idx], productId: value as string, unitPrice: prod?.price_cfa ?? 0 }
      } else {
        next[idx] = { ...next[idx], [field]: value }
      }
      return next
    })
  }

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1, color: '', unitPrice: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.cycleId) return
    const validItems = items.filter(i => i.productId && i.quantity > 0)
    if (!validItems.length) return
    setSaving(true)
    const order = await adminCreateGuestOrder({
      cycle_id: form.cycleId,
      customer_name: form.name,
      customer_phone: form.phone,
      items: validItems.map(i => ({ product_id: i.productId, quantity: i.quantity, unit_price: i.unitPrice, color: i.color || undefined })),
      total_amount: total,
    })
    if (order) {
      setSaved(true)
      setGuestOrders(prev => [order, ...prev])
      setForm({ name: '', phone: '', cycleId: '' })
      setItems([{ productId: '', quantity: 1, color: '', unitPrice: 0 }])
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Commandes sans compte</div>
      </div>

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
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Prénom Nom" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Téléphone</div>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+228 XX XX XX XX" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Cycle</div>
            <select value={form.cycleId} onChange={e => setForm(p => ({ ...p, cycleId: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none' }}>
              <option value="">Sélectionner un cycle…</option>
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase' }}>Articles</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 60px 120px auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <select value={item.productId} onChange={e => setItem(idx, 'productId', e.target.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '6px 8px', outline: 'none' }}>
                  <option value="">Produit…</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {fmt(p.price_cfa)} FCFA</option>)}
                </select>
                <input type="number" min={1} value={item.quantity} onChange={e => setItem(idx, 'quantity', parseInt(e.target.value) || 1)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 11, padding: '6px 8px', outline: 'none', textAlign: 'center' }} />
                <input value={item.color} onChange={e => setItem(idx, 'color', e.target.value)} placeholder="Couleur (opt.)" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 11, padding: '6px 8px', outline: 'none' }} />
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>×</button>
                )}
              </div>
            ))}
            <button onClick={addItem} style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.45)', borderRadius: 4, padding: '5px 12px', fontSize: 11, cursor: 'pointer', marginTop: 2 }}>+ Ajouter un article</button>
          </div>

          {total > 0 && (
            <div style={{ background: 'rgba(232,114,12,.08)', border: '1px solid rgba(232,114,12,.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Total calculé</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>{fmt(total)} FCFA</span>
            </div>
          )}

          <button onClick={handleSave} disabled={saving || loading} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4, width: '100%', opacity: saving ? .5 : 1 }}>
            {saved ? '✅ Commande enregistrée' : saving ? 'Enregistrement…' : 'Enregistrer la commande'}
          </button>
        </div>
      )}

      {tab === 'historique' && (
        loading ? (
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>Réf.</span><span>Client</span><span>Montant</span><span>Statut</span>
            </div>
            {guestOrders.map(o => (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, color: 'rgba(255,255,255,.7)', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{o.reference ?? '—'}</span>
                <span>
                  <div>{o.customer_name}</div>
                  <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
                </span>
                <span>{fmt(o.total_cfa ?? 0)} FCFA</span>
                <span><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, ...(STATUS_STYLE[o.status] ?? {}) }}>{STATUS_LABEL[o.status] ?? o.status}</span></span>
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
