'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setStatus('error')
          setTimeout(() => router.push('/connexion?error=1'), 2500)
        } else {
          setStatus('ok')
          setTimeout(() => router.push('/compte'), 1200)
        }
      })
    } else {
      // Flux implicite : Supabase a déjà mis la session dans le hash
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus('ok')
          setTimeout(() => router.push('/compte'), 1200)
        } else {
          setStatus('error')
          setTimeout(() => router.push('/connexion?error=1'), 2500)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirmation en cours…</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Veuillez patienter.</div>
          </>
        )}
        {status === 'ok' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Email confirmé !</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Redirection vers votre compte…</div>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#991B1B', marginBottom: 8 }}>Lien expiré ou invalide</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Redirection vers la connexion…</div>
          </>
        )}
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>Chargement…</div>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
