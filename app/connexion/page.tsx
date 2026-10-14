'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'

function ConnexionInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/compte'
  const hasError = searchParams.get('error') === '1'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', terms: false })
  const [error, setError] = useState(hasError ? 'Le lien de confirmation a expiré. Reconnectez-vous.' : '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdReg, setShowPwdReg] = useState(false)

  const update = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Remplissez tous les champs.'); return }
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) { setError('Email ou mot de passe incorrect.'); return }
    router.push(redirect)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Remplissez les champs obligatoires.'); return }
    if (form.password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    if (!form.terms) { setError('Acceptez les conditions pour continuer.'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.name, form.phone)
    setLoading(false)
    if (error) { setError(error); return }
    setSuccess('Compte créé ! Vérifiez votre e-mail pour confirmer, puis connectez-vous.')
    setMode('login')
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 24 }}>
        {(['login', 'register'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{ padding: '8px 24px', fontSize: 14, fontWeight: 600, background: mode === m ? 'var(--orange)' : 'var(--white)', color: mode === m ? '#fff' : 'var(--text-2)', border: '1.5px solid var(--border-2)', borderRadius: m === 'login' ? '20px 0 0 20px' : '0 20px 20px 0', cursor: 'pointer', borderLeft: m === 'register' ? 'none' : undefined }}>
            {m === 'login' ? 'Connexion' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 400, margin: '0 auto' }}>
        {success && (
          <div style={{ fontSize: 13, color: '#166534', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 12px', marginBottom: 16 }}>{success}</div>
        )}

        {mode === 'login' ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Connexion</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Accédez à vos commandes, reçus et suivi de colis.</p>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Adresse e-mail</label>
                <input style={inputStyle} type="email" placeholder="votre@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, paddingRight: 40 }} type={showPwd ? 'text' : 'password'} placeholder="Votre mot de passe" value={form.password} onChange={e => update('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-3)', padding: 0, lineHeight: 1 }}>{showPwd ? '🙈' : '👁'}</button>
                </div>
              </div>
              {error && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 12, padding: '8px 12px', background: '#FEE8E8', borderRadius: 6 }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: 44, borderRadius: 22, fontSize: 15, justifyContent: 'center', opacity: loading ? .7 : 1 }}>
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
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
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Nom complet *</label>
                <input style={inputStyle} type="text" placeholder="Prénom et nom" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Téléphone (WhatsApp)</label>
                <input style={inputStyle} type="tel" placeholder="+228 90 00 00 00" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Adresse e-mail *</label>
                <input style={inputStyle} type="email" placeholder="votre@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--text-2)' }}>Mot de passe * (min. 8 caractères)</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, paddingRight: 40 }} type={showPwdReg ? 'text' : 'password'} placeholder="Min. 8 caractères" value={form.password} onChange={e => update('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPwdReg(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-3)', padding: 0, lineHeight: 1 }}>{showPwdReg ? '🙈' : '👁'}</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 16 }}>
                <input type="checkbox" id="terms" checked={form.terms} onChange={e => update('terms', e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--orange)' }} />
                <label htmlFor="terms">J&apos;accepte les <a href="/politique-precommande" target="_blank" style={{ color: 'var(--orange)' }}>règles de la précommande</a> et la <a href="/confidentialite" target="_blank" style={{ color: 'var(--orange)' }}>politique de confidentialité</a>.</label>
              </div>
              {error && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 12, padding: '8px 12px', background: '#FEE8E8', borderRadius: 6 }}>{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: 44, borderRadius: 22, fontSize: 15, justifyContent: 'center', opacity: loading ? .7 : 1 }}>
                {loading ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-3)' }}>Chargement…</div>}>
      <ConnexionInner />
    </Suspense>
  )
}
