'use client'
import { useEffect, useState } from 'react'
import { adminGetProducts, adminUpdateProduct } from '@/lib/db'
import type { Product } from '@/lib/types'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function AdminDouane() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // fees keyed by product id — only contains what admin modified
  const [fees, setFees] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  useEffect(() => {
    adminGetProducts().then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const getValue = (p: Product) =>
    fees[p.id] !== undefined ? fees[p.id] : String(p.customs_fee_cfa ?? 0)

  const handleSaveAll = async () => {
    const changed = products.filter(p => fees[p.id] !== undefined)
    if (changed.length === 0) {
      setFeedback({ type: 'err', msg: 'Aucune modification à enregistrer.' })
      setTimeout(() => setFeedback(null), 3000)
      return
    }
    setSaving(true)
    const results = await Promise.all(
      changed.map(p => adminUpdateProduct(p.id, { customs_fee_cfa: parseInt(fees[p.id]) || 0 }))
    )
    const allOk = results.every(Boolean)
    if (allOk) {
      // Met à jour l'état local
      setProducts(prev => prev.map(p =>
        fees[p.id] !== undefined
          ? { ...p, customs_fee_cfa: parseInt(fees[p.id]) || 0 }
          : p
      ))
      setFees({})
      setFeedback({ type: 'ok', msg: `✅ ${changed.length} produit(s) mis à jour. Les frais s'appliquent à toutes les commandes concernées.` })
    } else {
      setFeedback({ type: 'err', msg: 'Erreur lors de l\'enregistrement. Réessayez.' })
    }
    setSaving(false)
    setTimeout(() => setFeedback(null), 5000)
  }

  const hasChanges = Object.keys(fees).length > 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frais de douane par produit</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
            Remplissez les frais par unité pour chaque article, puis cliquez <strong style={{ color: 'rgba(255,255,255,.7)' }}>Enregistrer tout</strong>.<br />
            Ces frais s&apos;appliquent automatiquement à toutes les commandes contenant chaque produit.
          </div>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving || !hasChanges}
          style={{ background: hasChanges ? 'var(--orange)' : 'rgba(255,255,255,.08)', color: hasChanges ? '#fff' : 'rgba(255,255,255,.3)', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: saving || !hasChanges ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16, transition: 'background .15s' }}>
          {saving ? 'Enregistrement…' : `Enregistrer tout${hasChanges ? ` (${Object.keys(fees).length})` : ''}`}
        </button>
      </div>

      {feedback && (
        <div style={{ background: feedback.type === 'ok' ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${feedback.type === 'ok' ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`, color: feedback.type === 'ok' ? '#4ADE80' : '#F87171', borderRadius: 6, padding: '10px 14px', fontSize: 12, marginBottom: 14 }}>
          {feedback.msg}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span>Produit</span>
            <span style={{ textAlign: 'right' }}>Prix vente</span>
            <span style={{ textAlign: 'right' }}>Frais douane / unité</span>
            <span style={{ textAlign: 'right' }}>% du prix</span>
          </div>

          {products.map(p => {
            const val = getValue(p)
            const fee = parseInt(val) || 0
            const pct = p.price_cfa > 0 ? ((fee / p.price_cfa) * 100).toFixed(1) : '—'
            const isModified = fees[p.id] !== undefined
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12, alignItems: 'center', color: 'rgba(255,255,255,.75)', background: isModified ? 'rgba(232,114,12,.04)' : 'transparent' }}>
                <span>
                  <div style={{ fontWeight: isModified ? 600 : 400 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{p.category}</div>
                </span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,.5)' }}>{fmt(p.price_cfa)} FCFA</span>
                <span style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={e => setFees(prev => ({ ...prev, [p.id]: e.target.value }))}
                      style={{ width: 90, background: 'rgba(255,255,255,.08)', border: `1.5px solid ${isModified ? 'rgba(232,114,12,.5)' : 'rgba(255,255,255,.12)'}`, color: '#fff', borderRadius: 4, fontSize: 12, padding: '5px 8px', outline: 'none', textAlign: 'right' }}
                    />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>FCFA</span>
                  </div>
                </span>
                <span style={{ textAlign: 'right', fontSize: 11, color: fee > 0 ? 'rgba(251,191,36,.8)' : 'rgba(255,255,255,.2)' }}>
                  {fee > 0 ? `${pct}%` : '—'}
                </span>
              </div>
            )
          })}

          {products.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucun produit actif</div>
          )}
        </div>
      )}

      {hasChanges && (
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Enregistrement…' : `Enregistrer tout (${Object.keys(fees).length} modification${Object.keys(fees).length > 1 ? 's' : ''})`}
          </button>
        </div>
      )}
    </div>
  )
}
