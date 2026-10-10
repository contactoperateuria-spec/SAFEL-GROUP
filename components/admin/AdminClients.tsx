'use client'
import { useState } from 'react'

const CLIENTS = [
  { name: 'Adjobi Kossi', phone: '+228 90 00 00 00', email: 'adjobi@email.com', orders: 3, total: '128 000 FCFA', since: 'Juil. 2025', badge: 'Régulier' },
  { name: 'Ami Dossou', phone: '+228 91 00 00 00', email: 'ami.dossou@email.com', orders: 1, total: '29 000 FCFA', since: 'Oct. 2025', badge: 'Nouveau' },
  { name: 'Kofi Mensah', phone: '+228 92 00 00 00', email: '', orders: 5, total: '214 000 FCFA', since: 'Mai 2025', badge: 'VIP' },
  { name: 'Aku Agbeko', phone: '+228 93 00 00 00', email: 'aku@email.com', orders: 2, total: '89 500 FCFA', since: 'Août 2025', badge: 'Régulier' },
]

const badgeStyle = (b: string): React.CSSProperties => ({
  'VIP': { background: 'rgba(251,191,36,.2)', color: '#FBB924' },
  'Régulier': { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  'Nouveau': { background: 'rgba(74,222,128,.12)', color: '#4ADE80' },
}[b] ?? {})

export default function AdminClients() {
  const [search, setSearch] = useState('')
  const filtered = CLIENTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Clients ({CLIENTS.length})</div>
        <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Exporter CSV</button>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou téléphone…" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span>Client</span><span>Commandes</span><span>Total dépensé</span><span>Membre depuis</span><span>Actions</span>
        </div>
        {filtered.map(c => (
          <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
            <span>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{c.phone}</div>
              {c.email && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{c.email}</div>}
            </span>
            <span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...badgeStyle(c.badge) }}>{c.badge}</span>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{c.orders} commande{c.orders > 1 ? 's' : ''}</div>
            </span>
            <span>{c.total}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{c.since}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent' }}>Historique</button>
              <a href={`https://wa.me/${c.phone.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noreferrer" style={{ border: '1px solid rgba(74,222,128,.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent', textDecoration: 'none' }}>WA</a>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
