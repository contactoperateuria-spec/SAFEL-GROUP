'use client'
import { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderStatus, adminUpdateProduct, adminLogActivity, adminDeleteOrder } from '@/lib/db'

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
  const [cycleFilter, setCycleFilter] = useState('Tous cycles')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  // customsFeeInput keyed by product_id
  const [customsFeeInput, setCustomsFeeInput] = useState<Record<string, string>>({})
  const [savingFee, setSavingFee] = useState<string | null>(null)

  useEffect(() => {
    adminGetOrders().then(data => { setOrders(data); setLoading(false) })
  }, [])

  const cycles = Array.from(new Set(orders.map(o => o.cycles?.name).filter(Boolean))) as string[]

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.customer_phone?.includes(search) || o.reference?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Tous statuts' || STATUS_LABEL[o.status] === statusFilter
    const matchCycle = cycleFilter === 'Tous cycles' || o.cycles?.name === cycleFilter
    return matchSearch && matchStatus && matchCycle
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    const order = orders.find(o => o.id === id)
    const ok = await adminUpdateOrderStatus(id, newStatus)
    if (ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
      adminLogActivity('status', 'orders', id, {
        message: `Commande ${order?.reference ?? id.slice(0, 8)} → ${STATUS_LABEL[newStatus] ?? newStatus}`,
        from: order?.status, to: newStatus, reference: order?.reference,
      })
    }
    setUpdating(null)
  }

  const handleConfirmPayment = async (id: string) => {
    await handleStatusChange(id, 'paid')
  }

  const handleDeleteOrder = async (id: string) => {
    const order = orders.find(o => o.id === id)
    const ref = order?.reference ?? id.slice(0, 8)
    if (!confirm(`Supprimer définitivement la commande ${ref} ?\n\nCette action est irréversible.`)) return
    const ok = await adminDeleteOrder(id)
    if (ok) {
      setOrders(prev => prev.filter(o => o.id !== id))
      adminLogActivity('delete', 'orders', id, {
        message: `Commande supprimée : ${ref} — ${order?.customer_name ?? ''}`,
        reference: ref,
      })
    }
  }

  const handleSaveProductFee = async (productId: string, fee: number) => {
    setSavingFee(productId)
    const ok = await adminUpdateProduct(productId, { customs_fee_cfa: fee })
    if (ok) {
      setOrders(prev => prev.map(o => ({
        ...o,
        order_items: (o.order_items ?? []).map((item: any) =>
          item.products?.id === productId
            ? { ...item, products: { ...item.products, customs_fee_cfa: fee } }
            : item
        )
      })))
      const productName = orders.flatMap(o => o.order_items ?? []).find((i: any) => i.products?.id === productId)?.products?.name
      adminLogActivity('douane', 'products', productId, {
        message: `Frais douane "${productName ?? productId.slice(0, 8)}" : ${fee.toLocaleString('fr-FR')} FCFA/u`,
        fee_cfa: fee,
      })
    }
    setSavingFee(null)
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
        <select value={cycleFilter} onChange={e => setCycleFilter(e.target.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none' }}>
          <option value="Tous cycles">Tous cycles</option>
          {cycles.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(o => {
            const isOpen = expandedOrder === o.id
            const needsFee = o.status === 'in_customs' || o.status === 'customs_cleared'
            return (
              <div key={o.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                {/* Ligne principale */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr 1.2fr auto', gap: 8, padding: '10px 14px', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
                  <span>
                    <div style={{ fontWeight: 600, fontSize: 11 }}>{o.reference ?? '—'}</div>
                    <div style={{ fontSize: 10, opacity: .4 }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</div>
                    {o.cycles?.name && <div style={{ fontSize: 10, color: 'rgba(99,179,237,.7)', marginTop: 2 }}>{o.cycles.name}</div>}
                  </span>
                  <span>
                    <div>{o.customer_name}</div>
                    <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--orange)' }}>{fmt(o.total_cfa ?? 0)} FCFA</span>
                  <span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 4, ...(STATUS_STYLE[o.status] ?? {}) }}>{STATUS_LABEL[o.status] ?? o.status}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {o.status === 'pending' && (
                        <button disabled={updating === o.id} onClick={() => handleConfirmPayment(o.id)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', opacity: updating === o.id ? .5 : 1 }}>
                          {updating === o.id ? '…' : '✓ Confirmer paiement'}
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button onClick={() => handleDeleteOrder(o.id)} style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', color: '#F87171', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                          🗑 Supprimer
                        </button>
                      )}
                      {o.status !== 'pending' && (() => {
                        const isPaid = !['pending'].includes(o.status)
                        const cancelStatuses = ['cancelled', 'refunded']
                        const available = ALL_STATUSES.filter(s => {
                          if (s === o.status) return false
                          if (isPaid && cancelStatuses.includes(s)) return false
                          return true
                        })
                        return available.length > 0 ? (
                          <select value="" onChange={e => { if (e.target.value) handleStatusChange(o.id, e.target.value) }} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 10, padding: '2px 6px', outline: 'none', width: '100%' }}>
                            <option value="">Changer statut…</option>
                            {available.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                          </select>
                        ) : null
                      })()}
                    </div>
                  </span>
                  <button onClick={() => setExpandedOrder(isOpen ? null : o.id)} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {isOpen ? '▲' : '▼ Détails'}
                  </button>
                </div>

                {/* Panneau détail */}
                {isOpen && (() => {
                  const items = o.order_items ?? []
                  const totalCustoms = items.reduce((s: number, i: any) => s + (i.products?.customs_fee_cfa ?? 0) * i.quantity, 0)
                  return (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '12px 14px', background: 'rgba(0,0,0,.15)' }}>

                      {/* Articles + frais de douane par produit */}
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Articles commandés</div>
                      {items.length === 0 ? (
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 12 }}>Aucun article enregistré</div>
                      ) : (
                        <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 14 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                              <th style={{ textAlign: 'left', padding: '4px 6px', color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Article</th>
                              <th style={{ textAlign: 'center', padding: '4px 6px', color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Qté</th>
                              <th style={{ textAlign: 'right', padding: '4px 6px', color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>P.U.</th>
                              <th style={{ textAlign: 'right', padding: '4px 6px', color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Frais douane/u</th>
                              <th style={{ textAlign: 'right', padding: '4px 6px', color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Total article</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item: any) => {
                              const pid = item.products?.id
                              const currentFee = item.products?.customs_fee_cfa ?? 0
                              const inputKey = pid ?? item.id
                              const inputVal = customsFeeInput[inputKey] ?? String(currentFee)
                              return (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                                  <td style={{ padding: '6px 6px', color: 'rgba(255,255,255,.7)' }}>
                                    <div>{item.products?.name ?? 'Produit'}</div>
                                    {item.color && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{item.color}</div>}
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '6px 6px', color: 'rgba(255,255,255,.6)' }}>{item.quantity}</td>
                                  <td style={{ textAlign: 'right', padding: '6px 6px', color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap' }}>{fmt(item.unit_price_cfa ?? 0)}</td>
                                  <td style={{ padding: '6px 6px' }}>
                                    {pid ? (
                                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <input
                                          type="number"
                                          value={inputVal}
                                          onChange={e => setCustomsFeeInput(prev => ({ ...prev, [inputKey]: e.target.value }))}
                                          style={{ width: 70, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(251,191,36,.3)', color: '#fff', borderRadius: 4, fontSize: 11, padding: '3px 6px', outline: 'none', textAlign: 'right' }}
                                        />
                                        <button
                                          disabled={savingFee === pid}
                                          onClick={() => handleSaveProductFee(pid, parseInt(inputVal) || 0)}
                                          style={{ background: 'rgba(251,191,36,.2)', border: '1px solid rgba(251,191,36,.4)', color: '#FBBF24', borderRadius: 4, padding: '3px 7px', fontSize: 10, fontWeight: 600, cursor: savingFee === pid ? 'wait' : 'pointer', opacity: savingFee === pid ? .6 : 1, whiteSpace: 'nowrap' }}>
                                          {savingFee === pid ? '…' : '✓'}
                                        </button>
                                      </div>
                                    ) : <span style={{ color: 'rgba(255,255,255,.3)' }}>—</span>}
                                  </td>
                                  <td style={{ textAlign: 'right', padding: '6px 6px', fontWeight: 600, color: 'var(--orange)', whiteSpace: 'nowrap' }}>{fmt((item.unit_price_cfa ?? 0) * item.quantity)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'right', padding: '8px 6px 0', fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,.8)' }}>Total marchandises</td>
                              <td style={{ textAlign: 'right', padding: '8px 6px 0', fontWeight: 700, color: 'var(--orange)', whiteSpace: 'nowrap' }}>{fmt(o.total_cfa ?? 0)} FCFA</td>
                            </tr>
                            {totalCustoms > 0 && (
                              <tr>
                                <td colSpan={4} style={{ textAlign: 'right', padding: '4px 6px', fontSize: 11, color: 'rgba(251,191,36,.8)' }}>Frais de douane calculés</td>
                                <td style={{ textAlign: 'right', padding: '4px 6px', fontSize: 11, color: 'rgba(251,191,36,.8)', whiteSpace: 'nowrap' }}>{fmt(totalCustoms)} FCFA</td>
                              </tr>
                            )}
                          </tfoot>
                        </table>
                      )}
                      {totalCustoms === 0 && items.length > 0 && (
                        <div style={{ fontSize: 10, color: 'rgba(251,191,36,.5)', marginTop: -8, marginBottom: 8 }}>
                          💡 Frais de douane : entrez le montant par unité sur chaque article, puis cliquez ✓. S&apos;applique à toutes les commandes contenant ce produit.
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center', background: 'rgba(255,255,255,.03)', borderRadius: 'var(--radius)' }}>Aucune commande trouvée</div>
          )}
        </div>
      )}
    </div>
  )
}
