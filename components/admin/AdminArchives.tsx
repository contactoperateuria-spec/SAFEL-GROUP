const ARCHIVED = [
  { emoji: '👟', bg: '#E8F0FE', name: 'Sneakers unisexe Blanc', reason: 'Cycle Juillet 2025 · Rupture fournisseur', price: '22 000 FCFA' },
  { emoji: '💻', bg: '#FFF0E6', name: 'Clavier mécanique RGB', reason: 'Cycle Août 2025 · Plus rentable', price: '45 000 FCFA' },
  { emoji: '🕶️', bg: '#F3F0FF', name: 'Lunettes de soleil polarisées', reason: 'Cycle Août 2025 · Stock épuisé', price: '8 500 FCFA' },
]

export default function AdminArchives() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Archives produits</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>{ARCHIVED.length} produits archivés</div>
      </div>

      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(251,146,60,.15)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 14, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
        Les produits archivés ne sont plus visibles dans le catalogue. Ils peuvent être réactivés à tout moment.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ARCHIVED.map(p => (
          <div key={p.name} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 10, alignItems: 'center', opacity: .8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, filter: 'grayscale(40%)' }}>{p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{p.reason} · {p.price}</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', color: '#4ADE80', padding: '5px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>↩ Réactiver</button>
              <button style={{ border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.3)', padding: '5px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 'var(--radius)', padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>Règle d&apos;archivage automatique</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Archiver automatiquement les produits inactifs depuis</span>
          <select style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '4px 8px', outline: 'none' }}>
            <option>2 cycles</option><option>3 cycles</option><option>Jamais</option>
          </select>
          <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}
