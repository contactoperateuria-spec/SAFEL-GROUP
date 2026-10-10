'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setError('Entrez le mot de passe.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Mot de passe incorrect.')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#16162A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1E1E2E', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 36, width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: 'var(--orange)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 800, fontSize: 18, color: '#fff' }}>SG</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Espace Admin</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>SAFEL GROUP · Accès restreint</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mot de passe admin</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{ width: '100%', height: 44, background: 'rgba(255,255,255,.07)', border: `1.5px solid ${error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.12)'}`, borderRadius: 8, padding: '0 14px', fontSize: 16, color: '#fff', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.1em' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#F87171', marginBottom: 12, padding: '6px 10px', background: 'rgba(239,68,68,.1)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', height: 44, background: loading ? 'rgba(232,114,12,.5)' : 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}
          >
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
