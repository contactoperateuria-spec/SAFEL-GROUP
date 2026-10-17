'use client'
import { useEffect, useState } from 'react'
import { adminGetCycles, adminUpdateCycleStatus, adminCreateCycle, adminLogActivity, adminGetDraftProducts, adminActivateDraftProducts, adminArchiveActiveProducts, adminGetOrdersByCycle, adminUpdateOrderStatus } from '@/lib/db'

const STATUS_LABEL: Record<string, string> = {
  open: 'OUVERT', closed: 'FERMÉ', in_transit: 'EN TRANSIT',
  arrived: 'ARRIVÉ', archived: 'ARCHIVÉ',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  closed: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  in_transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  arrived: { background: 'rgba(74,222,128,.2)', color: '#4ADE80' },
  archived: { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' },
}

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  open: [{ label: 'Fermer le cycle', next: 'closed' }],
  closed: [{ label: 'Passer en transit', next: 'in_transit' }],
  in_transit: [{ label: 'Marquer arrivé', next: 'arrived' }],
  arrived: [{ label: 'Archiver', next: 'archived' }],
}

export default function AdminCycles() {
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', closedAt: '' })
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [draftCount, setDraftCount] = useState(0)
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null)
  const [cycleOrders, setCycleOrders] = useState<Record<string, any[]>>({})
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [recapCycle, setRecapCycle] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([adminGetCycles(), adminGetDraftProducts()]).then(([data, drafts]) => {
      setCycles(data)
      setDraftCount(drafts.length)
      setLoading(false)
    })
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    const cycle = cycles.find(c => c.id === id)

    // Fermeture du cycle : archiver actifs + activer brouillons
    if (newStatus === 'closed' && cycle?.status === 'open') {
      const drafts = await adminGetDraftProducts()
      const msg = drafts.length > 0
        ? `Fermer le cycle "${cycle.name}" ?\n\n• ${drafts.length} article(s) en brouillon seront activés dans le catalogue.\n• Les articles actifs actuels seront archivés.`
        : `Fermer le cycle "${cycle.name}" ?\n\nAucun brouillon en attente. Les articles actifs seront archivés.`
      if (!confirm(msg)) { setUpdating(null); return }

      await adminArchiveActiveProducts()
      if (drafts.length > 0) {
        await adminActivateDraftProducts()
        setDraftCount(0)
      }
      adminLogActivity('cycle', 'cycles', id, {
        message: `Cycle "${cycle.name}" fermé — ${drafts.length} brouillon(s) activé(s), articles précédents archivés`,
        drafts_activated: drafts.length,
      })
    }

    const ok = await adminUpdateCycleStatus(id, newStatus)
    if (ok) {
      setCycles(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
      if (newStatus !== 'closed') {
        adminLogActivity('cycle', 'cycles', id, {
          message: `Cycle "${cycle?.name ?? id.slice(0, 8)}" → ${STATUS_LABEL[newStatus] ?? newStatus}`,
          from: cycle?.status, to: newStatus, name: cycle?.name,
        })
      }
    }
    setUpdating(null)
  }

  const ORDER_STATUS_LABEL: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée',
    in_transit: 'En transit', in_customs: 'En douane', customs_cleared: 'Dédouanée',
    ready: 'Prête à retirer', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
  }
  const ALL_ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'in_transit', 'in_customs', 'customs_cleared', 'ready', 'delivered']

  const buildRecap = (cycleId: string) => {
    const orders = cycleOrders[cycleId] ?? []
    const map: Record<string, { name: string; image: string | null; totalQty: number; details: { color: string | null; size: string | null; qty: number }[] }> = {}
    for (const order of orders) {
      for (const item of (order.order_items ?? [])) {
        const pid = item.products?.id ?? item.product_id ?? 'unknown'
        if (!map[pid]) {
          map[pid] = { name: item.products?.name ?? '—', image: item.products?.images?.[0] ?? null, totalQty: 0, details: [] }
        }
        map[pid].totalQty += item.quantity ?? 1
        const key = `${item.color ?? ''}|${item.size ?? ''}`
        const existing = map[pid].details.find(d => `${d.color ?? ''}|${d.size ?? ''}` === key)
        if (existing) existing.qty += item.quantity ?? 1
        else map[pid].details.push({ color: item.color ?? null, size: item.size ?? null, qty: item.quantity ?? 1 })
      }
    }
    return Object.values(map).sort((a, b) => b.totalQty - a.totalQty)
  }

  const toggleRecap = async (cycleId: string) => {
    if (recapCycle === cycleId) { setRecapCycle(null); return }
    if (!cycleOrders[cycleId]) {
      setLoadingOrders(cycleId)
      const orders = await adminGetOrdersByCycle(cycleId)
      setCycleOrders(prev => ({ ...prev, [cycleId]: orders }))
      setLoadingOrders(null)
    }
    setRecapCycle(cycleId)
    setExpandedCycle(null)
  }

  const toggleCycleOrders = async (cycleId: string) => {
    if (expandedCycle === cycleId) { setExpandedCycle(null); return }
    setExpandedCycle(cycleId)
    setRecapCycle(null)
    if (cycleOrders[cycleId]) return
    setLoadingOrders(cycleId)
    const orders = await adminGetOrdersByCycle(cycleId)
    setCycleOrders(prev => ({ ...prev, [cycleId]: orders }))
    setLoadingOrders(null)
  }

  const handleOrderStatusChange = async (cycleId: string, orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    const ok = await adminUpdateOrderStatus(orderId, newStatus)
    if (ok) {
      setCycleOrders(prev => ({
        ...prev,
        [cycleId]: (prev[cycleId] ?? []).map(o => o.id === orderId ? { ...o, status: newStatus } : o),
      }))
    }
    setUpdatingOrder(null)
  }

  const handleCreate = async () => {
    if (!form.name || !form.closedAt) return
    setSaving(true)
    const ok = await adminCreateCycle(form.name, form.closedAt)
    if (ok) {
      adminLogActivity('create', 'cycles', undefined, {
        message: `Nouveau cycle créé : "${form.name}" — clôture le ${new Date(form.closedAt).toLocaleDateString('fr-FR')}`,
        name: form.name, closed_at: form.closedAt,
      })
      const updated = await adminGetCycles()
      setCycles(updated)
      setForm({ name: '', closedAt: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Cycles de commande</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nouveau cycle</button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Créer un cycle</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Nom du cycle</div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Novembre 2025" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Date de fermeture estimée</div>
              <input type="date" value={form.closedAt} onChange={e => setForm(p => ({ ...p, closedAt: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cycles.map(c => {
            const isOpen = c.status === 'open'
            const borderColor = isOpen ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.08)'
            const bgColor = isOpen ? 'rgba(74,222,128,.05)' : 'rgba(255,255,255,.04)'
            const actions = TRANSITIONS[c.status] ?? []
            return (
              <div key={c.id} style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isOpen ? '#4ADE80' : 'rgba(255,255,255,.8)' }}>
                      {isOpen ? '● ' : ''}{c.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                      Ouvert le {c.opened_at ? new Date(c.opened_at).toLocaleDateString('fr-FR') : '—'}
                      {c.closed_at ? ` · Clôture le ${new Date(c.closed_at).toLocaleDateString('fr-FR')}` : ''}
                    </div>
                    {isOpen && draftCount > 0 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#C084FC', background: 'rgba(192,132,252,.1)', border: '1px solid rgba(192,132,252,.2)', borderRadius: 4, padding: '3px 8px', display: 'inline-block' }}>
                        ⏳ {draftCount} article{draftCount > 1 ? 's' : ''} en brouillon prêt{draftCount > 1 ? 's' : ''} à activer
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, fontWeight: 600, ...(STATUS_STYLE[c.status] ?? {}) }}>{STATUS_LABEL[c.status] ?? c.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {actions.map(a => (
                    <button key={a.next} disabled={updating === c.id} onClick={() => handleStatusChange(c.id, a.next)} style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent', opacity: updating === c.id ? .5 : 1 }}>
                      {updating === c.id ? '…' : a.label}
                    </button>
                  ))}
                  <button onClick={() => toggleCycleOrders(c.id)} style={{ border: '1px solid rgba(147,197,253,.3)', color: '#93C5FD', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent', marginLeft: actions.length > 0 ? 4 : 0 }}>
                    {expandedCycle === c.id ? '▲ Masquer commandes' : '▼ Voir commandes'}
                  </button>
                  <button onClick={() => toggleRecap(c.id)} style={{ border: '1px solid rgba(251,191,36,.3)', color: '#FCD34D', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: recapCycle === c.id ? 'rgba(251,191,36,.1)' : 'transparent' }}>
                    {recapCycle === c.id ? '▲ Masquer récap' : '📋 Récapitulatif'}
                  </button>
                </div>

                {recapCycle === c.id && (
                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12 }}>
                    {loadingOrders === c.id ? (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', padding: '8px 0' }}>Chargement…</div>
                    ) : (() => {
                      const recap = buildRecap(c.id)
                      if (recap.length === 0) return <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '8px 0' }}>Aucun article commandé dans ce cycle.</div>
                      return (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            Récapitulatif — {recap.reduce((s, r) => s + r.totalQty, 0)} article{recap.reduce((s, r) => s + r.totalQty, 0) > 1 ? 's' : ''} au total
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recap.map((item, i) => (
                              <div key={i} style={{ background: 'rgba(251,191,36,.04)', border: '1px solid rgba(251,191,36,.12)', borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                {item.image && (
                                  <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.9)' }}>{item.name}</div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#FCD34D', background: 'rgba(251,191,36,.12)', borderRadius: 4, padding: '2px 10px' }}>×{item.totalQty}</span>
                                  </div>
                                  {item.details.some(d => d.color || d.size) && (
                                    <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {item.details.map((d, j) => (
                                        <span key={j} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }}>
                                          {[d.color, d.size].filter(Boolean).join(' · ')} × {d.qty}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {expandedCycle === c.id && (
                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12 }}>
                    {loadingOrders === c.id ? (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', padding: '8px 0' }}>Chargement…</div>
                    ) : (cycleOrders[c.id] ?? []).length === 0 ? (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', padding: '8px 0' }}>Aucune commande dans ce cycle.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(cycleOrders[c.id] ?? []).map(o => (
                          <div key={o.id} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{o.reference ?? o.id.slice(0, 8).toUpperCase()}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                                {o.client_name ?? o.guest_name ?? '—'} · {o.total_cfa ? `${o.total_cfa.toLocaleString('fr-FR')} CFA` : '—'}
                              </div>
                            </div>
                            <select
                              value={o.status}
                              disabled={updatingOrder === o.id}
                              onChange={e => handleOrderStatusChange(c.id, o.id, e.target.value)}
                              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)', borderRadius: 4, fontSize: 11, padding: '4px 8px', outline: 'none', cursor: 'pointer', opacity: updatingOrder === o.id ? .5 : 1 }}
                            >
                              {ALL_ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{s === o.status ? `✓ ${ORDER_STATUS_LABEL[s]}` : ORDER_STATUS_LABEL[s]}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {cycles.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Aucun cycle créé</div>
          )}
        </div>
      )}
    </div>
  )
}
