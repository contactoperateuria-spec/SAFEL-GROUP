'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ConnexionPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ phone: '', password: '', name: '', email: '', confirm: '', terms: false })
  const [error, setError] = useState('')

  const update = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone || !form.password) { setError('Remplissez tous les champs.'); return }
    router.push('/compte')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.password) { setError('Remplissez les champs obligatoires.'); return }
    if (!form.terms) { setError("Acceptez les conditions pour continuer."); return }
    router.push('/compte')
  }

  const inputStyle = {
    width: '100%', height: 42,
    border: '1.5px solid var(--border-2)',
    borderRadius: 'var(--radius)',
    padding: '0 12px',
    fontSize: 14, outline: 'none',
    background: 'var(--white)',
    color: 'var(--text)',
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 24 }}>
        {(['login', 'register'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError('') }} style={{ padding: '8px 24px', fontSize: 14, fontWeight: 600, background: mode === m ? 'var(--orange)' : 'var(--white)', color: mode === m ? '#fff' : 'var(--text-2)', border: '1.5px solid var(--border-2)', borderRadius: m === 'login' ? '20px 0 0 20px' : '0 20px 20px 0', cursor: 'pointer', borderLeft: m === 'register' ? 'none' : undefined }}>
            {m === 'login' ? 'Connexion' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 400, margin: '0 auto' }}>
        {mode === 'login' ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Connexion</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Accédez à vos commandes, reçus et suivi de colis.</p>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Téléphone ou e-mail</label>
                <input style={inputStyle} type="text" placeholder="Ex. +228 90 00 00 00" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Mot de passe</label>
                <input style={inputStyle} type="password" placeholder="Votre mot de passe" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <a href="#" style={{ fontSize: 12, color: 'var(--orange)', display: 'block', textAlign: 'right', marginBottom: 14 }}>Mot de passe oublié ?</a>
              {error && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 12, padding: '8px 12px', background: '#FEE8E8', borderRadius: 6 }}>{error}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', height: 44, borderRadius: 22, fontSize: 15, justifyContent: 'center' }}>Se connecter</button>
            </form>
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, margin: '14px 0', position: 'relative' }}>
              <span style={{ background: 'var(--white)', padding: '0 8px', position: 'relative', zIndex: 1 }}>ou</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
            </div>
            <button onClick={() => setMode('register')} className="btn-outline" style={{ width: '100%', height: 44, borderRadius: 22, justifyContent: 'center', fontSize: 15 }}>Créer un compte</button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Créer un compte</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Rejoignez SAFEL GROUP pour précommander facilement.</p>
            <form onSubmit={handleRegister}>
              {[
                { key: 'name', label: 'Nom complet *', type: 'text', placeholder: 'Prénom et nom' },
                { key: 'phone', label: 'Téléphone *', type: 'tel', placeholder: '+228 90 00 00 00' },
                { key: 'email', label: 'E-mail (optionnel)', type: 'email', placeholder: 'votre@email.com' },
                { key: 'password', label: 'Mot de passe *', type: 'password', placeholder: 'Min. 8 caractères' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>{f.label}</label>
                  <input style={inputStyle} type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string} onChange={e => update(f.key, e.target.value)} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 16 }}>
                <input type="checkbox" id="terms" checked={form.terms} onChange={e => update('terms', e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--orange)' }} />
                <label htmlFor="terms">J&apos;accepte les <a href="#" style={{ color: 'var(--orange)' }}>règles de la précommande</a> et la <a href="#" style={{ color: 'var(--orange)' }}>politique de confidentialité</a> de SAFEL GROUP.</label>
              </div>
              {error && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 12, padding: '8px 12px', background: '#FEE8E8', borderRadius: 6 }}>{error}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', height: 44, borderRadius: 22, fontSize: 15, justifyContent: 'center' }}>Créer mon compte</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
