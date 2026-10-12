'use client'
import { useEffect, useState } from 'react'
import { adminGetArchivedProducts, adminGetCycles, adminUpdateProduct, adminDeleteProduct, adminDeleteCycle } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const btnDel: React.CSSProperties = {
  background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)',
  color: '#f87171', padding: '5px 10px', borderRadius: 4, fontSize: 11,
  fontWeight: 600, cursor: 'pointer',
}

export default function AdminArchives() {
  const [tab, setTab] = useState<'produits' | 'cycles'>('produits')
  const [products, setProducts] = useState<any[]>([])
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reactivating, setReactivating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([adminGetArchivedProducts(), adminGetCycles()]).then(([pr, cy]) => {
      setProducts(pr)
      setCycles(cy.filter((c: any) => c.status === 'archived'))
      setLoading(false)
    })
  }, [])

  const handleReactivate = async (id: string) => {
    setReactivating(id)
    const ok = await adminUpdateProduct(id, { is_active: true })
    if (ok) setProducts(prev => prev.filter(p => p.id !== id))
    setReactivating(null)
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ? Cette action est irréversible.`)) return
    setDeleting(id)
    const ok = await adminDeleteProduct(id)
    if (ok) setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleDeleteCycle = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le cycle "${name}" ? Cette action est irréversible.`)) return
    setDeleting(id)
    const ok = await adminDeleteCycle(id)
    if (ok) setCycles(prev => prev.filter(c => c.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Archives</div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: 3 }}>
        {(['produits', 'cycles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, border: 'none', borderRadius: 4, padding: '6px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,.45)' }}>
            {t === 'produits' ? `Produits archivés (${products.length})` : `Cycles archivés (${cycles.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : tab === 'produits' ? (
        <>
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(251,146,60,.15)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 14, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            Les produits archivés ne sont plus visibles dans le catalogue. La suppression définitive est irréversible.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products.map(p => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', gap: 10, alignItems: 'center', opacity: deleting === p.id ? .4 : .85 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{p.category} · {fmt(p.price_cfa ?? 0)} FCFA</div>
                </div>
                <button
                  disabled={reactivating === p.id || deleting === p.id}
                  onClick={() => handleReactivate(p.id)}
                  style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', color: '#4ADE80', padding: '5px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: reactivating === p.id ? .5 : 1 }}
                >
                  {reactivating === p.id ? '…' : '↩ Réactiver'}
                </button>
                <button
                  disabled={deleting === p.id || reactivating === p.id}
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  style={{ ...btnDel, opacity: deleting === p.id ? .5 : 1 }}
                >
                  {deleting === p.id ? '…' : '🗑 Supprimer définitivement'}
                </button>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', padding: '20px 0', textAlign: 'center' }}>Aucun produit archivé</div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(251,146,60,.15)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 14, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            La suppression définitive d'un cycle est irréversible. Les commandes liées restent en base.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cycles.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', alignItems: 'center', gap: 10, opacity: deleting === c.id ? .4 : .8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                    Ouvert le {c.opened_at ? new Date(c.opened_at).toLocaleDateString('fr-FR') : '—'}
                    {c.arrived_at ? ` · Arrivé le ${new Date(c.arrived_at).toLocaleDateString('fr-FR')}` : ''}
                  </div>
                </div>
                <button
                  disabled={deleting === c.id}
                  onClick={() => handleDeleteCycle(c.id, c.name)}
                  style={{ ...btnDel, opacity: deleting === c.id ? .5 : 1 }}
                >
                  {deleting === c.id ? '…' : '🗑 Supprimer définitivement'}
                </button>
              </div>
            ))}
            {cycles.length === 0 && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', padding: '20px 0', textAlign: 'center' }}>Aucun cycle archivé</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
