export default function AdminCycles() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Cycles de commande</div>

      <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ADE80' }}>● Cycle en cours — Octobre 2025</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Ouvert le 01/10/2025 · Clôture le 31/10/2025</div>
          </div>
          <span style={{ fontSize: 10, background: 'rgba(74,222,128,.15)', color: '#4ADE80', padding: '3px 10px', borderRadius: 4, fontWeight: 600 }}>OUVERT</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>📅 Prolonger la clôture</button>
          <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>🔒 Clôturer maintenant</button>
          <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✏️ Modifier les dates</button>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>Cycle Septembre 2025</div>
          <span style={{ fontSize: 10, background: 'rgba(147,197,253,.15)', color: '#93C5FD', padding: '3px 10px', borderRadius: 4, fontWeight: 600 }}>EN TRANSIT</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>01/09 → 30/09 · 38 commandes · 2 180 000 FCFA</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>📋 Voir les commandes</button>
          <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>🚢 Mettre à jour le statut</button>
        </div>
      </div>

      <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}>+ Créer un nouveau cycle</button>
    </div>
  )
}
