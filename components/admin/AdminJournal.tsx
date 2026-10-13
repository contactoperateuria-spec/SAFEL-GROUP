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

  const FILTERS = ['Toutes les opérations', 'orders', 'products', 'cycles', 'settings']

  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Heure', 'Type', 'Action', 'Description'],
      ...logs.map(l => {
        const d = new Date(l.created_at)
        const date = d.toLocaleDateString('fr-FR')
        const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        const type = l.entity_type ?? ''
        const action = l.action ?? ''
        const msg = l.details?.message ?? `${action} · ${type}${l.entity_id ? ` #${l.entity_id.slice(0, 8)}` : ''}`
        return [date, time, type, action, msg]
      }),
    ]
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-safel-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Journal d&apos;opérations ({logs.length})</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 11, padding: '5px 10px', outline: 'none' }}>
            {FILTERS.map(f => <option key={f}>{f}</option>)}
          </select>
          <button onClick={handleExportCSV} disabled={logs.length === 0} style={{ background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', color: '#4ADE80', borderRadius: 4, fontSize: 11, fontWeight: 600, padding: '5px 12px', cursor: logs.length === 0 ? 'not-allowed' : 'pointer', opacity: logs.length === 0 ? .4 : 1, whiteSpace: 'nowrap' }}>
            ⬇ Export CSV
          </button>
        </div>
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
