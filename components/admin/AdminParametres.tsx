'use client'
import { useState } from 'react'

const SOUS_ADMINS = [
  { name: 'Yao Komla', role: 'Gestionnaire', perms: ['Commandes', 'Clients'], since: '01/09/2025' },
]

const PERMS_ALL = ['Commandes', 'Produits', 'Clients', 'Douane', 'Bordereaux', 'Cycles', 'Paramètres']

export default function AdminParametres() {
  const [shopName, setShopName] = useState('SAFEL GROUP')
  const [whatsapp, setWhatsapp] = useState('22896045369')
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Paramètres</div>

      {/* Boutique */}
      <Section title="Informations de la boutique">
        <Field label="Nom de la boutique">
          <input value={shopName} onChange={e => setShopName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Numéro WhatsApp (sans +)">
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Logo de la boutique">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(232,114,12,.15)', border: '1.5px dashed var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer' }}>📦</div>
            <button style={{ border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.6)', padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>Changer le logo</button>
          </div>
        </Field>
        <button onClick={save} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
          {saved ? '✅ Paramètres enregistrés' : 'Enregistrer'}
        </button>
      </Section>

      {/* Sous-admins */}
      <Section title="Sous-administrateurs">
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
          {SOUS_ADMINS.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(147,197,253,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{a.role} · Depuis {a.since}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {a.perms.map(p => (
                    <span key={p} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(147,197,253,.12)', color: '#93C5FD' }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent' }}>Éditer</button>
                <button style={{ border: '1px solid rgba(239,68,68,.3)', color: '#F87171', padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', background: 'transparent' }}>Retirer</button>
              </div>
            </div>
          ))}
        </div>
        <button style={{ background: 'transparent', border: '1.5px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.45)', borderRadius: 6, padding: '8px 0', fontSize: 12, cursor: 'pointer', width: '100%' }}>+ Inviter un sous-admin</button>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>Permissions disponibles</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PERMS_ALL.map(p => (
              <span key={p} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }}>{p}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Archivage */}
      <Section title="Archivage & Données">
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
          Les commandes archivées restent accessibles en lecture seule. Les produits inactifs depuis 2 cycles sont automatiquement archivés.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button style={{ border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)', padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>Exporter toutes les données</button>
          <button style={{ border: '1px solid rgba(239,68,68,.25)', color: '#F87171', padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'transparent' }}>Réinitialiser les données de démo</button>
        </div>
      </Section>
    </div>
  )
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

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}
