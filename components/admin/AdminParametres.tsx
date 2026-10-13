'use client'
import { useEffect, useState } from 'react'
import {
  adminGetSettings, adminUpdateSetting,
  adminGetSubAdmins, adminCreateSubAdmin, adminToggleSubAdmin, adminDeleteSubAdmin,
  ALL_PERMISSIONS, type SubAdmin,
} from '@/lib/db'
import { supabase } from '@/lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
  color: '#fff', borderRadius: 4, fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

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

const ROLE_LABELS: Record<string, string> = { super_admin: 'Super Admin', admin: 'Admin', viewer: 'Lecteur' }
const ROLE_COLORS: Record<string, string> = { super_admin: '#f97316', admin: '#3b82f6', viewer: '#6b7280' }

export default function AdminParametres() {
  const [tab, setTab] = useState<'boutique' | 'equipe'>('boutique')

  // -- Paramètres boutique
  const [shopName, setShopName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [archivingRules, setArchivingRules] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // -- Sous-admins
  const [admins, setAdmins] = useState<SubAdmin[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    email: '', name: '', role: 'admin' as 'admin' | 'viewer', tempPassword: '',
    permissions: Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, true])) as Record<string, boolean>,
  })
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [createdPassword, setCreatedPassword] = useState('')

  useEffect(() => {
    adminGetSettings().then(settings => {
      setShopName((settings.shop_name as string) ?? 'SAFEL GROUP')
      setWhatsapp((settings.whatsapp as string) ?? '')
      setArchivingRules((settings.archiving_rules as string) ?? '')
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (tab === 'equipe') {
      setAdminsLoading(true)
      adminGetSubAdmins().then(data => { setAdmins(data); setAdminsLoading(false) })
    }
  }, [tab])

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

  const togglePerm = (key: string) => setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }))

  const handleCreate = async () => {
    if (!form.email || !form.name || !form.tempPassword) { setFormError('Email, nom et mot de passe requis.'); return }
    if (form.tempPassword.length < 6) { setFormError('Le mot de passe doit faire au moins 6 caractères.'); return }
    setFormSaving(true); setFormError('')

    // Créer le compte Supabase Auth pour le sous-admin
    const { error: authError } = await supabase.auth.signUp({ email: form.email, password: form.tempPassword })
    if (authError && !authError.message.includes('already registered')) {
      setFormError('Erreur création compte : ' + authError.message)
      setFormSaving(false)
      return
    }

    // Insérer dans la table admins
    const { email, name, role, permissions } = form
    const ok = await adminCreateSubAdmin({ email, name, role, permissions })
    if (!ok) { setFormError('Erreur lors de la création.'); setFormSaving(false); return }

    setCreatedPassword(form.tempPassword)
    setShowForm(false)
    setForm({ email: '', name: '', role: 'admin', tempPassword: '', permissions: Object.fromEntries(ALL_PERMISSIONS.map(p => [p.key, true])) })
    const data = await adminGetSubAdmins()
    setAdmins(data)
    setFormSaving(false)
  }

  const handleToggle = async (id: string, current: boolean) => {
    await adminToggleSubAdmin(id, !current)
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce sous-admin ?')) return
    await adminDeleteSubAdmin(id)
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Paramètres</div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}>
        {(['boutique', 'equipe'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 20px', fontSize: 12, fontWeight: 600, background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,.5)', border: 'none', cursor: 'pointer' }}>
            {t === 'boutique' ? 'Boutique' : 'Équipe'}
          </button>
        ))}
      </div>

      {tab === 'boutique' && (
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
      )}

      {tab === 'equipe' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{admins.length} sous-admin{admins.length !== 1 ? 's' : ''}</div>
            <button onClick={() => { setShowForm(v => !v); setCreatedPassword('') }} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {showForm ? 'Annuler' : '+ Ajouter un sous-admin'}
            </button>
          </div>

          {/* Confirmation après création */}
          {createdPassword && (
            <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', marginBottom: 4 }}>✓ Sous-admin créé</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Transmets ce mot de passe au sous-admin :</div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 6, padding: '6px 10px', background: 'rgba(0,0,0,.3)', borderRadius: 4 }}>{createdPassword}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 6 }}>Il pourra le modifier après sa première connexion. Note : si la confirmation email est activée dans Supabase, le sous-admin doit d&apos;abord confirmer son email.</div>
              <button onClick={() => setCreatedPassword('')} style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer' }}>Fermer</button>
            </div>
          )}

          {showForm && (
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>Nouveau sous-admin</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <Field label="Nom complet">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" style={inputStyle} />
                </Field>
                <Field label="Email">
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemple.com" type="email" style={inputStyle} />
                </Field>
              </div>
              <Field label="Mot de passe temporaire">
                <input value={form.tempPassword} onChange={e => setForm(f => ({ ...f, tempPassword: e.target.value }))} placeholder="Min. 6 caractères" type="text" style={inputStyle} />
              </Field>
              <Field label="Rôle">
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'viewer' }))} style={selectStyle}>
                  <option value="admin">Admin (peut modifier)</option>
                  <option value="viewer">Lecteur (consultation uniquement)</option>
                </select>
              </Field>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>Autorisations</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {ALL_PERMISSIONS.map(p => (
                    <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.7)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!form.permissions[p.key]} onChange={() => togglePerm(p.key)} style={{ accentColor: 'var(--orange)', width: 13, height: 13 }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              {formError && <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8 }}>{formError}</div>}
              <button onClick={handleCreate} disabled={formSaving} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: formSaving ? .5 : 1 }}>
                {formSaving ? 'Création…' : 'Créer le sous-admin'}
              </button>
            </div>
          )}

          {adminsLoading ? (
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, padding: 20, textAlign: 'center' }}>Chargement…</div>
          ) : admins.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: 32, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
              Aucun sous-admin créé
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {admins.map(a => (
                <div key={a.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{a.name}</span>
                      <span style={{ fontSize: 10, background: ROLE_COLORS[a.role] + '22', color: ROLE_COLORS[a.role], border: `1px solid ${ROLE_COLORS[a.role]}44`, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                        {ROLE_LABELS[a.role] ?? a.role}
                      </span>
                      {!a.is_active && <span style={{ fontSize: 10, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.3)', borderRadius: 4, padding: '1px 6px' }}>Désactivé</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>{a.email}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {ALL_PERMISSIONS.map(p => (
                        <span key={p.key} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: a.permissions?.[p.key] ? 'rgba(249,115,22,.15)' : 'rgba(255,255,255,.04)', color: a.permissions?.[p.key] ? 'var(--orange)' : 'rgba(255,255,255,.2)', border: `1px solid ${a.permissions?.[p.key] ? 'rgba(249,115,22,.25)' : 'rgba(255,255,255,.06)'}` }}>
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleToggle(a.id, a.is_active)} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 4, color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}>
                      {a.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 4, color: '#f87171', cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
