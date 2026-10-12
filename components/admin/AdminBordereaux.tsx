'use client'
import { useEffect, useState } from 'react'
import { adminGetBordereaux, adminGetCycles, adminCreateBordereau, adminUpdateBordereauStatus, adminGetOrders, adminAssignOrdersToBordereau } from '@/lib/db'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyé', in_customs: 'En douane',
  customs_cleared: 'Douane OK', delivered: 'Livré',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  draft: { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)' },
  sent: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  in_customs: { background: 'rgba(251,191,36,.15)', color: '#FBB924' },
  customs_cleared: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  delivered: { background: 'rgba(74,222,128,.2)', color: '#4ADE80' },
}
const NEXT_STATUS: Record<string, string> = {
  draft: 'sent', sent: 'in_customs', in_customs: 'customs_cleared', customs_cleared: 'delivered',
}
const NEXT_LABEL: Record<string, string> = {
  draft: 'Marquer envoyé', sent: 'En douane', in_customs: 'Douane OK', customs_cleared: 'Livré',
}

export default function AdminBordereaux() {
  const [bordereaux, setBordereaux] = useState<any[]>([])
  const [cycles, setCycles] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ number: '', cycleId: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedBl, setSelectedBl] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    Promise.all([adminGetBordereaux(), adminGetCycles(), adminGetOrders()]).then(([bl, cy, ord]) => {
      setBordereaux(bl); setCycles(cy); setOrders(ord); setLoading(false)
    })
  }, [])

  const ordersWithoutBl = orders.filter(o =>
    (o.status === 'paid' || o.status === 'confirmed') && !o.bordereau_orders?.length
  )

  const handleCreate = async () => {
    if (!form.number || !form.cycleId) return
    setSaving(true)
    const ok = await adminCreateBordereau(form.cycleId, form.number, form.notes || undefined)
    if (ok) {
      const updated = await adminGetBordereaux()
      setBordereaux(updated)
      setForm({ number: '', cycleId: '', notes: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    const ok = await adminUpdateBordereauStatus(id, newStatus)
    if (ok) setBordereaux(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    setUpdating(null)
  }

  const handleAssign = async () => {
    if (!selectedBl || !selectedOrders.length) return
    setAssigning(true)
    await adminAssignOrdersToBordereau(selectedBl, selectedOrders)
    setSelectedOrders([])
    setAssigning(false)
  }

  const toggleOrder = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Bordereaux & Lots</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nouveau bordereau</button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Créer un bordereau</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Numéro BL</div>
              <input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="BL-2025-010" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Cycle</div>
              <select value={form.cycleId} onChange={e => setForm(p => ({ ...p, cycleId: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none' }}>
                <option value="">Sélectionner un cycle…</option>
                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Notes (optionnel)</div>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Remarques sur ce bordereau…" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} disabled={saving} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: saving ? .5 : 1 }}>{saving ? 'Création…' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', borderRadius: 6, padding: '7px 16px', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>Bordereau</span><span>Cycle</span><span>Statut</span><span>Action</span>
            </div>
            {bordereaux.map(b => (
              <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
                <span style={{ fontWeight: 600 }}>{b.number}</span>
                <span style={{ fontSize: 11, opacity: .7 }}>{b.cycles?.name ?? '—'}</span>
                <span><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...(STATUS_STYLE[b.status] ?? {}) }}>{STATUS_LABEL[b.status] ?? b.status}</span></span>
                <span>
                  {NEXT_STATUS[b.status] && (
                    <button disabled={updating === b.id} onClick={() => handleStatusChange(b.id, NEXT_STATUS[b.status])} style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent', opacity: updating === b.id ? .5 : 1 }}>
                      {updating === b.id ? '…' : NEXT_LABEL[b.status]}
                    </button>
                  )}
                </span>
              </div>
            ))}
            {bordereaux.length === 0 && (
              <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucun bordereau</div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)', marginBottom: 8 }}>Associer commandes à un bordereau</div>
            <select value={selectedBl ?? ''} onChange={e => setSelectedBl(e.target.value || null)} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none', marginBottom: 8 }}>
              <option value="">Choisir un bordereau…</option>
              {bordereaux.map(b => <option key={b.id} value={b.id}>{b.number}</option>)}
            </select>
            {selectedBl && (
              <>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>Commandes payées/confirmées sans bordereau :</div>
                {ordersWithoutBl.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '8px 0' }}>Aucune commande disponible</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                    {ordersWithoutBl.map(o => (
                      <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,.7)', padding: '4px 8px', background: selectedOrders.includes(o.id) ? 'rgba(232,114,12,.08)' : 'transparent', borderRadius: 4 }}>
                        <input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={() => toggleOrder(o.id)} />
                        <span>{o.reference ?? '—'} · {o.customer_name} · {(o.total_cfa ?? 0).toLocaleString('fr-FR')} FCFA</span>
                      </label>
                    ))}
                  </div>
                )}
                <button disabled={!selectedOrders.length || assigning} onClick={handleAssign} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!selectedOrders.length || assigning) ? .5 : 1 }}>
                  {assigning ? 'Association…' : `Associer ${selectedOrders.length > 0 ? selectedOrders.length + ' commande(s)' : ''}`}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
