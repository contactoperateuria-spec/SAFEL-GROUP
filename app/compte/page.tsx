'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile, signOut, type Profile } from '@/lib/auth'
import { getOrderByRef } from '@/lib/db'
import { supabase } from '@/lib/supabase'

const MENU = ['Mes commandes', 'Mes reçus', 'Paramètres']

function fmt(n: number) { return n.toLocaleString('fr-FR') }

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function ComptePage() {
  const router = useRouter()
  const [tab, setTab] = useState('Mes commandes')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    getUser().then(async user => {
      if (!user) { router.push('/connexion?redirect=/compte'); return }
      setEmail(user.email ?? '')
      const p = await getProfile(user.id)
      setProfile(p)
      // Charger les commandes du client par téléphone ou email
      const phone = p?.phone ?? ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('orders') as any)
        .select('*')
        .or(`customer_email.eq.${user.email},customer_phone.eq.${phone}`)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoadingOrders(false)
      setAuthLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-3)' }}>
        Chargement…
      </div>
    )
  }

  const statusStyle = (s: string) => {
    if (s === 'paid') return { background: '#F0FDF4', color: '#166534' }
    if (s === 'transit') return { background: '#EEF2FF', color: '#4338CA' }
    if (s === 'delivered') return { background: '#F0FDF4', color: '#166534' }
    return { background: '#FFF7ED', color: '#C05E08' }
  }
  const statusLabel = (s: string) => ({ pending: 'En attente', paid: 'Payé', transit: 'En transit', delivered: 'Livré' }[s] ?? s)

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--orange-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--orange)', margin: '0 auto 12px' }}>
              {profile ? initials(profile.name) : '?'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{profile?.name ?? 'Client'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{profile?.phone || email}</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {MENU.map((item, i) => (
              <button key={item} onClick={() => setTab(item)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: tab === item ? 600 : 400, color: tab === item ? 'var(--text)' : 'var(--text-2)', cursor: 'pointer', textAlign: 'left', background: tab === item ? 'var(--orange-light)' : 'none', borderLeft: tab === item ? '3px solid var(--orange)' : '3px solid transparent', borderTop: i > 0 ? '1px solid var(--border)' : 'none', borderRight: 'none', borderBottom: 'none' }}>
                {item}
              </button>
            ))}
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: '#C62828', cursor: 'pointer', textAlign: 'left', background: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid var(--border)', borderRight: 'none', borderBottom: 'none' }}>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{tab}</h2>

          {tab === 'Mes commandes' && (
            <>
              {loadingOrders ? (
                <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Chargement des commandes…</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Aucune commande</div>
                  <Link href="/catalogue" className="btn-primary" style={{ fontSize: 13 }}>Parcourir le catalogue</Link>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 6 }}>
                          {order.reference} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)' }}>{fmt(order.total_cfa)} FCFA</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, ...statusStyle(order.status) }}>{statusLabel(order.status)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'Mes reçus' && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Vos reçus PDF</div>
              <div style={{ fontSize: 13 }}>Téléchargez vos reçus depuis la page coupon après chaque commande.</div>
              <Link href="/coupon" style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>Aller à mes coupons</Link>
            </div>
          )}

          {tab === 'Paramètres' && profile && (
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 400 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Nom complet</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.name}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Téléphone WhatsApp</div>
                <div style={{ fontSize: 14 }}>{profile.phone || 'Non renseigné'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>E-mail</div>
                <div style={{ fontSize: 14 }}>{email}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
