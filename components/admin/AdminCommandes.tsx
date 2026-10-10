'use client'
import { useState } from 'react'

const ORDERS = [
  { ref: 'SG-2025-0047', client: 'Adjobi Kossi', phone: '+228 90 00 00 00', desc: 'Sérum ×2, Écouteurs ×1, Robe ×2', amount: '56 000 FCFA', status: 'pending', statusLabel: 'En attente' },
  { ref: 'SG-2025-0046', client: 'Ami Dossou', phone: '+228 91 00 00 00', desc: 'Robe florale ×2', amount: '29 000 FCFA', status: 'paid', statusLabel: 'Payé' },
  { ref: 'SG-2025-0041', client: 'Kofi Mensah', phone: '+228 92 00 00 00', desc: 'Écouteurs ×1', amount: '18 000 FCFA', status: 'transit', statusLabel: 'En transit' },
]

const badge = (s: string): React.CSSProperties => ({
  pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
}[s] ?? {})

const STATUTS = ['Tous statuts', 'En attente', 'Payé', 'En transit', 'Arrivé à Lomé', 'Livré']

export default function AdminCommandes() {
  const [search, setSearch] = useState('')
  const filtered = ORDERS.filter(o => o.ref.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Commandes</div>
        <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Exporter CSV</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande…" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '6px 12px', outline: 'none', flex: 1, minWidth: 160 }} />
        <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none' }}>
          {STATUTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none' }}>
          <option>Cycle : Octobre 2025</option><option>Septembre 2025</option>
        </select>
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span>Réf.</span><span>Client</span><span>Articles</span><span>Montant</span><span>Statut / Action</span>
        </div>
        {filtered.map(o => (
          <div key={o.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 2fr 1fr 1.2fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
            <span style={{ fontWeight: 600 }}>{o.ref}</span>
            <span>
              <div>{o.client}</div>
              <div style={{ fontSize: 10, opacity: .5 }}>{o.phone}</div>
            </span>
            <span style={{ fontSize: 11, opacity: .7 }}>{o.desc}</span>
            <span>{o.amount}</span>
            <span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, display: 'block', marginBottom: 4, ...badge(o.status) }}>{o.statusLabel}</span>
              {o.status === 'pending' && (
                <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>✓ Confirmer paiement</button>
              )}
              {o.status !== 'pending' && (
                <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 10, padding: '2px 6px', outline: 'none', width: '100%' }}>
                  <option>Changer statut…</option>
                  <option>Acheté en Chine</option><option>Expédié</option><option>En transit</option><option>Arrivé à Lomé</option>
                </select>
              )}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,.35)', textAlign: 'right' }}>47 commandes ce mois · Page 1/4</div>
    </div>
  )
}
