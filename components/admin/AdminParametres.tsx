'use client'
import { useEffect, useState } from 'react'
import { adminGetSettings, adminUpdateSetting } from '@/lib/db'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.07)' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {children}
    </div>
  )
}

export default function AdminParametres() {
  const [shopName, setShopName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [archivingRules, setArchivingRules] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminGetSettings().then(settings => {
      setShopName((settings.shop_name as string) ?? 'SAFEL GROUP')
      setWhatsapp((settings.whatsapp as string) ?? '')
      setArchivingRules((settings.archiving_rules as string) ?? '')
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    await Promise.all([
      adminUpdateSetting('shop_name', shopName),
      adminUpdateSetting('whatsapp', whatsapp),
      adminUpdateSetting('archiving_rules', archivingRules),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Paramètres</div>

      <Section title="Informations de la boutique">
        <Field label="Nom de la boutique">
          <input value={shopName} onChange={e => setShopName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Numéro WhatsApp (sans +)">
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="22870000000" style={inputStyle} />
        </Field>
        <Field label="Règles d'archivage">
          <input value={archivingRules} onChange={e => setArchivingRules(e.target.value)} placeholder="Ex: 2 cycles" style={inputStyle} />
        </Field>
        <button onClick={save} disabled={saving} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4, opacity: saving ? .5 : 1 }}>
          {saved ? '✅ Paramètres enregistrés' : saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </Section>
    </div>
  )
}
