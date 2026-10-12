'use client'
import { useEffect, useState } from 'react'
import { adminGetDashboardStats } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', paid: 'Payé',
  in_transit: 'En transit', delivered: 'Livré', cancelled: 'Annulé',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  confirmed: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  in_transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  delivered: { background: 'rgba(74,222,128,.2)', color: '#4ADE80' },
  cancelled: { background: 'rgba(239,68,68,.15)', color: '#F87171' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ total: number; revenue: number; pending: number; paid: number; recent: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetDashboardStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  const cards = stats ? [
    { label: 'Commandes totales', value: String(stats.total), color: '#fff' },
    { label: 'CA total (FCFA)', value: fmt(stats.revenue), color: 'var(--orange)' },
    { label: 'En attente paiement', value: String(stats.pending), color: '#FB923C' },
    { label: 'Payées', value: String(stats.paid), color: '#4ADE80' },
  ] : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Tableau de bord</div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {cards.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: 14, fontWeight: 600 }}>Dernières commandes</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>Réf.</span><span>Client</span><span>Montant</span><span>Statut</span>
            </div>
            {stats?.recent.map((o: any) => (
              <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
                <span style={{ fontWeight: 600 }}>{o.reference ?? '—'}</span>
                <span>
                  <div>{o.customer_name}</div>
                  <div style={{ fontSize: 10, opacity: .5 }}>{o.customer_phone}</div>
                </span>
                <span>{fmt(o.total_cfa ?? 0)} FCFA</span>
                <span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...(STATUS_STYLE[o.status] ?? {}) }}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </span>
              </div>
            ))}
            {stats?.recent.length === 0 && (
              <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucune commande pour l&apos;instant</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
