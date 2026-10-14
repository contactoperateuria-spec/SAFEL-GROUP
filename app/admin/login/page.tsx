'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'super' | 'sub'>('super')

  // Super admin
  const [password, setPassword] = useState('')

  // Sous-admin
  const [email, setEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = tab === 'super'
      ? { password }
      : { email, adminPassword }

    if (tab === 'super' && !password.trim()) { setError('Entrez le mot de passe.'); setLoading(false); return }
    if (tab === 'sub' && (!email.trim() || !adminPassword.trim())) { setError('Email et mot de passe requis.'); setLoading(false); return }

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Erreur de connexion.')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#16162A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 36, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: 'var(--orange)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: 18, color: '#fff' }}>SG</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Espace Admin</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>SAFEL GROUP · Accès restreint</div>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: 3, marginBottom: 24, gap: 3 }}>
          {(['super', 'sub'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: tab === t ? 'var(--orange)' : 'transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,.4)', transition: 'background .15s' }}>
              {t === 'super' ? 'Super Admin' : 'Sous-admin'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'super' ? (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mot de passe admin</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  style={{ width: '100%', height: 44, background: 'rgba(255,255,255,.07)', border: `1.5px solid ${error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '0 40px 0 14px', fontSize: 16, color: '#fff', outline: 'none', boxSizing: 'border-box', letterSpacing: showPassword ? 'normal' : '0.1em' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,.4)', padding: 0, lineHeight: 1 }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  autoFocus
                  style={{ width: '100%', height: 44, background: 'rgba(255,255,255,.07)', border: `1.5px solid ${error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '0 14px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', height: 44, background: 'rgba(255,255,255,.07)', border: `1.5px solid ${error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '0 40px 0 14px', fontSize: 16, color: '#fff', outline: 'none', boxSizing: 'border-box', letterSpacing: showAdminPassword ? 'normal' : '0.1em' }}
                  />
                  <button type="button" onClick={() => setShowAdminPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'rgba(255,255,255,.4)', padding: 0, lineHeight: 1 }}>
                    {showAdminPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ fontSize: 12, color: '#F87171', marginBottom: 12, padding: '6px 10px', background: 'rgba(239,68,68,.1)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: loading ? 'rgba(232,114,12,.5)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Vérification…' : 'Accéder au panel →'}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
          Les tentatives de connexion sont enregistrées.
        </div>
      </div>
    </div>
  )
}
