const STATS = [
  { label: 'Commandes du jour', value: '12', color: '#fff' },
  { label: 'CA du mois', value: '4 128 000', color: 'var(--orange)' },
  { label: 'En attente paiement', value: '7', color: '#FB923C' },
  { label: 'Livraisons prêtes', value: '3', color: '#4ADE80' },
]

const ORDERS = [
  { ref: 'SG-2025-0047', client: 'Adjobi Kossi', amount: '56 000 FCFA', status: 'En attente', statusClass: 'pending', action: 'Valider' },
  { ref: 'SG-2025-0046', client: 'Ami Dossou', amount: '29 000 FCFA', status: 'Payé', statusClass: 'paid', action: 'Détail' },
  { ref: 'SG-2025-0041', client: 'Kofi Mensah', amount: '18 000 FCFA', status: 'En transit', statusClass: 'transit', action: 'Bordereau' },
  { ref: 'SG-2025-0039', client: 'Aku Agbeko', amount: '42 500 FCFA', status: 'Payé', statusClass: 'paid', action: 'Détail' },
]

const badge = (cls: string) => {
  const styles: Record<string, React.CSSProperties> = {
    pending: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
    paid: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
    transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  }
  return styles[cls] ?? {}
}

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Tableau de bord · Octobre 2025</div>
        <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Exporter CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Dernières commandes</div>
          <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '4px 8px', outline: 'none' }}>
            <option>Tous statuts</option><option>En attente</option><option>Payé</option><option>En transit</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span>Réf.</span><span>Client</span><span>Montant</span><span>Statut</span><span>Action</span>
        </div>
        {ORDERS.map(o => (
          <div key={o.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)' }}>
            <span>{o.ref}</span>
            <span>{o.client}</span>
            <span>{o.amount}</span>
            <span><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, ...badge(o.statusClass) }}>{o.status}</span></span>
            <span>
              <button style={{ background: o.statusClass === 'pending' ? 'var(--orange)' : 'transparent', color: o.statusClass === 'pending' ? '#fff' : 'rgba(255,255,255,.6)', border: o.statusClass !== 'pending' ? '1px solid rgba(255,255,255,.2)' : 'none', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{o.action}</button>
            </span>
          </div>
        ))}
      </div>

      {/* Module douane rapide */}
      <div style={{ marginTop: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'rgba(255,255,255,.9)' }}>Module Douane</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none', flex: 1, minWidth: 140 }}>
            <option>Sélectionner un bordereau…</option>
            <option>BL-2025-008 · En transit</option>
          </select>
          <input type="number" placeholder="Frais douane FCFA" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', borderRadius: 4, fontSize: 12, padding: '6px 10px', outline: 'none', width: 150 }} />
          <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Appliquer & Notifier</button>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 6 }}>Les frais s&apos;appliquent automatiquement à tous les coupons payés du bordereau.</div>
      </div>
    </div>
  )
}
