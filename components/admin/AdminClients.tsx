'use client'
import { useEffect, useState } from 'react'
import { adminGetClients } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

function getBadge(orders: number, total: number): string {
  if (orders > 3 || total > 100000) return 'VIP'
  if (orders === 1) return 'Nouveau'
  return 'Régulier'
}

const badgeStyle = (b: string): React.CSSProperties => ({
  'VIP': { background: 'rgba(251,191,36,.2)', color: '#FBB924' },
  'Régulier': { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  'Nouveau': { background: 'rgba(74,222,128,.12)', color: '#4ADE80' },
}[b] ?? {})

export default function AdminClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetClients().then(data => { setClients(data); setLoading(false) })
  }, [])

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Clients ({filtered.length})</div>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou téléphone…" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span>Client</span><span>Commandes</span><span>Total dépensé</span><span>Actions</span>
          </div>
          {filtered.map((c, i) => {
            const badge = getBadge(c.orders, c.total)
            const waLink = `https://wa.me/${(c.phone ?? '').replace(/\s/g, '').replace('+', '')}`
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
                <span>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{c.phone}</div>
                  {c.email && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{c.email}</div>}
                </span>
                <span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...badgeStyle(badge) }}>{badge}</span>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{c.orders} commande{c.orders > 1 ? 's' : ''}</div>
                </span>
                <span>{fmt(c.total)} FCFA</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {c.phone && (
                    <a href={waLink} target="_blank" rel="noreferrer" style={{ border: '1px solid rgba(74,222,128,.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent', textDecoration: 'none' }}>WA</a>
                  )}
                </span>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucun client trouvé</div>
          )}
        </div>
      )}
    </div>
  )
}
