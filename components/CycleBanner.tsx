'use client'
import { useEffect, useState } from 'react'
import { getActiveCycle } from '@/lib/db'
import type { Cycle } from '@/lib/types'

const FALLBACK_CYCLE = {
  name: 'Cycle Octobre 2025',
  closedAt: '2025-10-31T23:59:59',
  label: 'Clôture le 31 octobre 2025',
}

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000))
      setTime({ d: Math.floor(diff / 86400), h: Math.floor((diff % 86400) / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

function pad(n: number) { return String(n).padStart(2, '0') }

function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 6, padding: '6px 10px', textAlign: 'center', minWidth: 48 }}>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{pad(value)}</div>
      <div style={{ fontSize: 9, opacity: .6, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function CycleBanner() {
  const [cycle, setCycle] = useState<Cycle | null>(null)

  useEffect(() => {
    getActiveCycle().then(data => setCycle(data)).catch(() => {})
  }, [])

  const closedAt = cycle?.closed_at ?? FALLBACK_CYCLE.closedAt
  const cycleName = cycle?.name ?? FALLBACK_CYCLE.name
  const closeLabel = cycle?.closed_at
    ? `Clôture le ${new Date(cycle.closed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : FALLBACK_CYCLE.label

  const { d, h, m, s } = useCountdown(closedAt)

  return (
    <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)', color: '#fff', padding: '14px 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, background: '#4ADE80', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 3px rgba(74,222,128,.25)' }} />
          <div>
            <div style={{ fontSize: 13, opacity: .7 }}>Groupage en cours</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{cycleName}</div>
            <div style={{ fontSize: 13, color: '#FCA162' }}>{closeLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <CountBlock value={d} label="jours" />
          <span style={{ fontSize: 18, fontWeight: 700, opacity: .4 }}>:</span>
          <CountBlock value={h} label="hres" />
          <span style={{ fontSize: 18, fontWeight: 700, opacity: .4 }}>:</span>
          <CountBlock value={m} label="min" />
          <span style={{ fontSize: 18, fontWeight: 700, opacity: .4 }}>:</span>
          <CountBlock value={s} label="sec" />
        </div>
      </div>
    </div>
  )
}
