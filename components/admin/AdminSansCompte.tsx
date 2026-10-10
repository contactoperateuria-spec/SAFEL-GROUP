'use client'
import { useState } from 'react'

type Tab = 'nouveau' | 'historique'

const HISTORY = [
  { ref: 'SG-2025-0043', name: 'Komi Adeyi', phone: '+228 96 00 00 00', total: '32 000 FCFA', date: '08/10/2025', status: 'Payé' },
  { ref: 'SG-2025-0039', name: 'Grace Fiagbe', phone: '+228 97 00 00 00', total: '18 500 FCFA', date: '07/10/2025', status: 'En attente' },
]

export default function AdminSansCompte() {
  const [tab, setTab] = useState<Tab>('nouveau')
  const [form, setForm] = useState({ name: '', phone: '', items: '', total: '', cycle: 'Octobre 2025' })
  const [saved, setSaved] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSave = () => { if (form.name && form.phone && form.total) { setSaved(true); setTimeout(() => setSaved(false), 3000) } }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Commandes sans compte</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: 3 }}>
        {(['nouveau', 'historique'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, border: 'none', borderRadius: 4, padding: '6px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,.45)', textTransform: 'capitalize' }}>
            {t === 'nouveau' ? '+ Nouveau reçu' : 'Historique'}
          </button>
        ))}
      </div>

      {tab === 'nouveau' && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'rgba(255,255,255,.85)' }}>Créer un reçu manuel</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Nom du client</div>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Prénom Nom" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Téléphone</div>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+228 XX XX XX XX" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Articles commandés</div>
              <textarea value={form.items} onChange={set('items')} placeholder="Ex : Sérum ×2, Robe taille L ×1" rows={2} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Montant total (FCFA)</div>
                <input type="number" value={form.total} onChange={set('total')} placeholder="0" style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase' }}>Cycle</div>
                <select value={form.cycle} onChange={set('cycle')} style={{ width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none' }}>
                  <option>Octobre 2025</option><option>Septembre 2025</option>
                </select>
              </div>
            </div>
            <button onClick={handleSave} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
              {saved ? '✅ Reçu généré avec succès' : 'Générer le reçu'}
            </button>
          </div>
        </div>
      )}

      {tab === 'historique' && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', fontSize: 11, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <span>Réf.</span><span>Client</span><span>Montant</span><span>Date</span><span>Statut</span>
          </div>
          {HISTORY.map(h => (
            <div key={h.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr', gap: 8, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, color: 'rgba(255,255,255,.7)', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{h.ref}</span>
              <span><div>{h.name}</div><div style={{ fontSize: 10, opacity: .5 }}>{h.phone}</div></span>
              <span>{h.total}</span>
              <span style={{ fontSize: 11, opacity: .6 }}>{h.date}</span>
              <span><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, ...(h.status === 'Payé' ? { background: 'rgba(74,222,128,.15)', color: '#4ADE80' } : { background: 'rgba(251,146,60,.15)', color: '#FB923C' }) }}>{h.status}</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
