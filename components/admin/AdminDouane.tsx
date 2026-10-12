'use client'
import { useEffect, useState } from 'react'
import { adminGetOrders, adminUpdateOrderCustomsFee } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function AdminDouane() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fees, setFees] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    adminGetOrders().then(data => {
      const relevant = data.filter((o: any) => o.status === 'paid' || o.status === 'in_transit')
      setOrders(relevant)
      const initFees: Record<string, number> = {}
      relevant.forEach((o: any) => { initFees[o.id] = o.customs_fee_cfa ?? 0 })
      setFees(initFees)
      setLoading(false)
    })
  }, [])

  const handleSave = async (id: string) => {
    setSaving(id)
    const ok = await adminUpdateOrderCustomsFee(id, fees[id] ?? 0)
    if (ok) {
      setSaved(id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, customs_fee_cfa: fees[id] } : o))
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frais de douane</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>Définissez les frais de douane par commande (statut payé ou en transit).</div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1.2fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span>Réf.</span><span>Client</span><span>Marchandises</span><span>Frais douane</span><span>Total final</span>
          </div>
          {orders.map(o => {
            const fee = fees[o.id] ?? 0
            const total = (o.total_cfa ?? 0) + fee
            return (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1.2fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
                <span style={{ fontWeight: 600 }}>{o.reference ?? '—'}</span>
                <span>
                  <div>{o.customer_name}</div>
                  <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
                </span>
                <span>{fmt(o.total_cfa ?? 0)} FCFA</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    value={fees[o.id] ?? 0}
                    onChange={e => setFees(prev => ({ ...prev, [o.id]: parseInt(e.target.value) || 0 }))}
                    style={{ width: 80, background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.15)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '4px 6px', outline: 'none', textAlign: 'right' }}
                  />
                  <button
                    disabled={saving === o.id}
                    onClick={() => handleSave(o.id)}
                    style={{ background: saved === o.id ? 'rgba(74,222,128,.2)' : 'var(--orange)', color: saved === o.id ? '#4ADE80' : '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer', opacity: saving === o.id ? .5 : 1, whiteSpace: 'nowrap' }}
                  >
                    {saved === o.id ? '✓' : saving === o.id ? '…' : 'Définir'}
                  </button>
                </span>
                <span>
                  {fee > 0 ? (
                    <div>
                      <div style={{ color: 'var(--orange)', fontWeight: 700 }}>+{fmt(fee)} FCFA</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{fmt(total)} FCFA total</div>
                    </div>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>—</span>
                  )}
                </span>
              </div>
            )
          })}
          {orders.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucune commande payée ou en transit</div>
          )}
        </div>
      )}
    </div>
  )
}
