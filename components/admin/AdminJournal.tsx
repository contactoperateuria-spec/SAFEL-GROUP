'use client'
import { useEffect, useState } from 'react'
import { adminGetActivityLog } from '@/lib/db'

const ACTION_COLOR: Record<string, string> = {
  paiement: '#4ADE80',
  payment: '#4ADE80',
  statut: '#93C5FD',
  status: '#93C5FD',
  produit: '#FB923C',
  product: '#FB923C',
  douane: '#FBB924',
  customs: '#FBB924',
  cycle: '#C084FC',
  bordereau: '#67E8F9',
  settings: '#FB923C',
  create: '#4ADE80',
  update: '#93C5FD',
  delete: '#F87171',
}

function getColor(action: string, entityType: string): string {
  const key = action.toLowerCase()
  const etype = entityType?.toLowerCase()
  return ACTION_COLOR[key] ?? ACTION_COLOR[etype] ?? 'rgba(255,255,255,.5)'
}

function formatTime(created_at: string): string {
  if (!created_at) return '—'
  const date = new Date(created_at)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  if (diffHours < 24) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (diffHours < 48) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function AdminJournal() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Toutes les opérations')

  useEffect(() => {
    adminGetActivityLog().then(data => { setLogs(data); setLoading(false) })
  }, [])

  const filtered = filter === 'Toutes les opérations' ? logs : logs.filter(l => l.entity_type?.toLowerCase() === filter.toLowerCase() || l.action?.toLowerCase() === filter.toLowerCase())

  const FILTERS = ['Toutes les opérations', 'orders', 'products', 'cycles', 'bordereaux', 'settings']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Journal d&apos;opérations</div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '5px 10px', outline: 'none' }}>
          {FILTERS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map((log: any, i: number) => {
            const color = getColor(log.action, log.entity_type)
            const badge = log.action ?? log.entity_type ?? '?'
            const msg = log.details?.message ?? log.details?.description ?? `${log.action} · ${log.entity_type}${log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}`
            return (
              <div key={log.id ?? i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)', alignItems: 'flex-start' }}>
                <div style={{ width: 40, fontSize: 10, color: 'rgba(255,255,255,.3)', paddingTop: 2, flexShrink: 0, textAlign: 'right' }}>{formatTime(log.created_at)}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${color}55` }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: `${color}20`, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>{badge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.4 }}>{msg}</div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 0', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center' }}>Aucune entrée dans le journal</div>
          )}
        </div>
      )}
    </div>
  )
}
