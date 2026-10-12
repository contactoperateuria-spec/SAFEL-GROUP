'use client'
import { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const STATUS_LABEL: Record<string, string> = {
  pending:         'En attente',
  confirmed:       'Confirmée',
  paid:            'Payée',
  in_transit:      'En transit',
  in_customs:      'En douane',
  customs_cleared: 'Dédouanée',
  ready:           'Prête à retirer',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending:         { background: 'rgba(251,146,60,.15)',  color: '#FB923C' },
  confirmed:       { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  paid:            { background: 'rgba(74,222,128,.15)',  color: '#4ADE80' },
  in_transit:      { background: 'rgba(99,179,237,.15)',  color: '#63B3ED' },
  in_customs:      { background: 'rgba(251,191,36,.15)',  color: '#FBBF24' },
  customs_cleared: { background: 'rgba(167,139,250,.15)', color: '#A78BFA' },
  ready:           { background: 'rgba(52,211,153,.15)',  color: '#34D399' },
  delivered:       { background: 'rgba(74,222,128,.2)',   color: '#4ADE80' },
  cancelled:       { background: 'rgba(239,68,68,.15)',   color: '#F87171' },
  refunded:        { background: 'rgba(156,163,175,.15)', color: '#9CA3AF' },
}
const ALL_STATUSES = ['pending', 'confirmed', 'paid', 'in_transit', 'in_customs', 'customs_cleared', 'ready', 'delivered', 'cancelled', 'refunded']
const FILTER_OPTIONS = ['Tous statuts', ...ALL_STATUSES.map(s => STATUS_LABEL[s])]

export default function AdminCommandes() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous statuts')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    adminGetOrders().then(data => { setOrders(data); setLoading(false) })
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.customer_phone?.includes(search) || o.reference?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Tous statuts' || STATUS_LABEL[o.status] === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    const ok = await adminUpdateOrderStatus(id, newStatus)
    if (ok) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    setUpdating(null)
  }

  const handleConfirmPayment = async (id: string) => {
    await handleStatusChange(id, 'paid')
  }

  const itemsSummary = (o: any) => {
    const items = o.order_items ?? []
    if (!items.length) return '—'
    return items.slice(0, 2).map((i: any) => `${i.products?.name ?? 'Produit'} ×${i.quantity}`).join(', ') + (items.length > 2 ? ` +${items.length - 2}` : '')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Commandes ({filtered.length})</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, téléphone, réf…" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '6px 12px', outline: 'none', flex: 1, minWidth: 160 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none' }}>
          {FILTER_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span>Réf.</span><span>Client</span><span>Articles</span><span>Montant</span><span>Statut / Action</span>
          </div>
          {filtered.map(o => (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
              <span style={{ fontWeight: 600 }}>{o.reference ?? '—'}</span>
              <span>
                <div>{o.customer_name}</div>
                <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
              </span>
              <span style={{ fontSize: 11, opacity: .7 }}>{itemsSummary(o)}</span>
              <span>{fmt(o.total_cfa ?? 0)} FCFA</span>
              <span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, display: 'block', marginBottom: 4, ...(STATUS_STYLE[o.status] ?? {}) }}>{STATUS_LABEL[o.status] ?? o.status}</span>
                {o.status === 'pending' && (
                  <button disabled={updating === o.id} onClick={() => handleConfirmPayment(o.id)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', opacity: updating === o.id ? .5 : 1 }}>
                    {updating === o.id ? '…' : '✓ Confirmer paiement'}
                  </button>
                )}
                {o.status !== 'pending' && (
                  <select value="" onChange={e => { if (e.target.value) handleStatusChange(o.id, e.target.value) }} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 10, padding: '2px 6px', outline: 'none', width: '100%' }}>
                    <option value="">Changer statut…</option>
                    {ALL_STATUSES.filter(s => s !== o.status).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                )}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucune commande trouvée</div>
          )}
        </div>
      )}
    </div>
  )
}
