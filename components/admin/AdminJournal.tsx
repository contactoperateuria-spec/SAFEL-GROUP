const LOGS = [
  { time: '10:42', type: 'paiement', badge: 'Paiement', color: '#4ADE80', msg: 'Paiement confirmé pour SG-2025-0047 (Adjobi Kossi · 56 000 FCFA)', user: 'Admin' },
  { time: '10:31', type: 'statut', badge: 'Statut', color: '#93C5FD', msg: 'Commande SG-2025-0041 passée en "Arrivé à Lomé"', user: 'Admin' },
  { time: '09:55', type: 'produit', badge: 'Produit', color: '#FB923C', msg: 'Nouveau produit ajouté : Robe florale S-XL (14 500 FCFA · Min. 2)', user: 'Admin' },
  { time: '09:23', type: 'douane', badge: 'Douane', color: '#FBB924', msg: 'Frais de douane appliqués sur BL-2025-007 · Total : 87 500 FCFA répartis sur 5 reçus', user: 'Admin' },
  { time: '08:47', type: 'cycle', badge: 'Cycle', color: '#C084FC', msg: 'Cycle Octobre 2025 ouvert. Clôture prévue le 31/10/2025', user: 'Système' },
  { time: 'Hier', type: 'paiement', badge: 'Paiement', color: '#4ADE80', msg: 'Paiement confirmé pour SG-2025-0046 (Ami Dossou · 29 000 FCFA)', user: 'Admin' },
  { time: 'Hier', type: 'bordereau', badge: 'Bordereau', color: '#67E8F9', msg: 'BL-2025-009 créé · 12 commandes associées · Expédition prévue 15/10', user: 'Admin' },
]

export default function AdminJournal() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Journal d&apos;opérations</div>
        <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '5px 10px', outline: 'none' }}>
          <option>Toutes les opérations</option>
          <option>Paiements</option><option>Statuts</option><option>Douane</option><option>Cycles</option><option>Bordereaux</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {LOGS.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)', alignItems: 'flex-start' }}>
            <div style={{ width: 40, fontSize: 10, color: 'rgba(255,255,255,.3)', paddingTop: 2, flexShrink: 0, textAlign: 'right' }}>{log.time}</div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.color, marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${log.color}55` }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: `${log.color}20`, color: log.color, textTransform: 'uppercase', letterSpacing: '.06em' }}>{log.badge}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>{log.user}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.4 }}>{log.msg}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center' }}>
        Affichage des 7 dernières entrées · <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>Voir tout l&apos;historique</button>
      </div>
    </div>
  )
}
