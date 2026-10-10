const BORDEREAUX = [
  { num: 'BL-2025-009', cmds: '12 commandes', total: '840 000 FCFA', status: 'En cours', cls: 'pending' },
  { num: 'BL-2025-008', cmds: '8 commandes', total: '620 000 FCFA', status: 'En transit', cls: 'transit' },
  { num: 'BL-2025-007', cmds: '15 commandes', total: '1 140 000 FCFA', status: 'Arrivé', cls: 'paid' },
]

const badge = (s: string): React.CSSProperties => ({
  pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
}[s] ?? {})

export default function AdminBordereaux() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Bordereaux & Lots</div>
        <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nouveau bordereau</button>
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span>Bordereau</span><span>Commandes</span><span>Montant total</span><span>Statut</span><span>Action</span>
        </div>
        {BORDEREAUX.map(b => (
          <div key={b.num} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
            <span style={{ fontWeight: 600 }}>{b.num}</span>
            <span>{b.cmds}</span>
            <span>{b.total}</span>
            <span><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...badge(b.cls) }}>{b.status}</span></span>
            <span><button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent' }}>Gérer</button></span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.9)', marginBottom: 8 }}>Associer commandes à un bordereau</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none', flex: 1, minWidth: 120 }}>
            <option>Choisir un bordereau…</option><option>BL-2025-009</option><option>BL-2025-008</option>
          </select>
          <input type="text" placeholder="Numéro du livreur / transporteur" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none', flex: 1, minWidth: 160 }} />
          <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
