'use client'
import { useEffect, useState } from 'react'
import { adminGetCycles, adminUpdateCycleStatus, adminCreateCycle } from '@/lib/db'

const STATUS_LABEL: Record<string, string> = {
  open: 'OUVERT', closed: 'FERMÉ', in_transit: 'EN TRANSIT',
  arrived: 'ARRIVÉ', archived: 'ARCHIVÉ',
}
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  open: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' },
  closed: { background: 'rgba(251,146,60,.15)', color: '#FB923C' },
  in_transit: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' },
  arrived: { background: 'rgba(74,222,128,.2)', color: '#4ADE80' },
  archived: { background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' },
}

const TRANSITIONS: Record<string, { label: string; next: string }[]> = {
  open: [{ label: 'Fermer le cycle', next: 'closed' }],
  closed: [{ label: 'Passer en transit', next: 'in_transit' }],
  in_transit: [{ label: 'Marquer arrivé', next: 'arrived' }],
  arrived: [{ label: 'Archiver', next: 'archived' }],
}

export default function AdminCycles() {
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', closedAt: '' })
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    adminGetCycles().then(data => { setCycles(data); setLoading(false) })
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    const ok = await adminUpdateCycleStatus(id, newStatus)
    if (ok) setCycles(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    setUpdating(null)
  }

  const handleCreate = async () => {
    if (!form.name || !form.closedAt) return
    setSaving(true)
    const ok = await adminCreateCycle(form.name, form.closedAt)
    if (ok) {
      const updated = await adminGetCycles()
      setCycles(updated)
      setForm({ name: '', closedAt: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Cycles de commande</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nouveau cycle</button>
      </div>

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Créer un cycle</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Nom du cycle</div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Novembre 2025" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Date de fermeture estimée</div>
              <input type="date" value={form.closedAt} onChange={e => setForm(p => ({ ...p, closedAt: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate} disabled={saving} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: saving ? .5 : 1 }}>{saving ? 'Création…' : 'Créer'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', borderRadius: 6, padding: '7px 16px', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cycles.map(c => {
            const isOpen = c.status === 'open'
            const borderColor = isOpen ? 'rgba(74,222,128,.2)' : 'rgba(255,255,255,.08)'
            const bgColor = isOpen ? 'rgba(74,222,128,.05)' : 'rgba(255,255,255,.04)'
            const actions = TRANSITIONS[c.status] ?? []
            return (
              <div key={c.id} style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isOpen ? '#4ADE80' : 'rgba(255,255,255,.8)' }}>
                      {isOpen ? '● ' : ''}{c.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                      Ouvert le {c.opened_at ? new Date(c.opened_at).toLocaleDateString('fr-FR') : '—'}
                      {c.closed_at ? ` · Clôture le ${new Date(c.closed_at).toLocaleDateString('fr-FR')}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, fontWeight: 600, ...(STATUS_STYLE[c.status] ?? {}) }}>{STATUS_LABEL[c.status] ?? c.status}</span>
                </div>
                {actions.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {actions.map(a => (
                      <button key={a.next} disabled={updating === c.id} onClick={() => handleStatusChange(c.id, a.next)} style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent', opacity: updating === c.id ? .5 : 1 }}>
                        {updating === c.id ? '…' : a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {cycles.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Aucun cycle créé</div>
          )}
        </div>
      )}
    </div>
  )
}
