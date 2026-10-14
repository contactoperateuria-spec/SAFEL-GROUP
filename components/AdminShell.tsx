'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from './admin/AdminDashboard'
import AdminCommandes from './admin/AdminCommandes'
import AdminProduits from './admin/AdminProduits'
import AdminCycles from './admin/AdminCycles'
import AdminDouane from './admin/AdminDouane'
import AdminClients from './admin/AdminClients'
import AdminSansCompte from './admin/AdminSansCompte'
import AdminArchives from './admin/AdminArchives'
import AdminJournal from './admin/AdminJournal'
import AdminParametres from './admin/AdminParametres'

type Section = 'dashboard' | 'commandes' | 'produits' | 'cycles' | 'douane' | 'clients' | 'sanscompte' | 'archives' | 'journal' | 'parametres'

const ALL_MENU: { key: Section; icon: string; label: string; permKey?: string }[] = [
  { key: 'dashboard',   icon: '📊', label: 'Tableau de bord' },
  { key: 'commandes',   icon: '📦', label: 'Commandes',         permKey: 'commandes' },
  { key: 'produits',    icon: '🛍️', label: 'Produits',          permKey: 'produits' },
  { key: 'cycles',      icon: '📅', label: 'Cycles',            permKey: 'cycles' },
  { key: 'douane',      icon: '🏛️', label: 'Douane',            permKey: 'douane' },
  { key: 'clients',     icon: '👥', label: 'Clients',           permKey: 'clients' },
  { key: 'sanscompte',  icon: '🧾', label: 'Achat sans compte', permKey: 'sans_compte' },
  { key: 'archives',    icon: '📁', label: 'Archives',          permKey: 'archives' },
  { key: 'journal',     icon: '📋', label: 'Journal',           permKey: 'journal' },
  { key: 'parametres',  icon: '⚙️', label: 'Paramètres',       permKey: 'parametres' },
]

const SECTIONS: Record<Section, React.ReactNode> = {
  dashboard:  <AdminDashboard />,
  commandes:  <AdminCommandes />,
  produits:   <AdminProduits />,
  cycles:     <AdminCycles />,
  douane:     <AdminDouane />,
  clients:    <AdminClients />,
  sanscompte: <AdminSansCompte />,
  archives:   <AdminArchives />,
  journal:    <AdminJournal />,
  parametres: <AdminParametres />,
}

type SessionInfo =
  | { type: 'super_admin' }
  | { type: 'sub_admin'; name: string; role: string; permissions: Record<string, boolean> }

export default function AdminShell() {
  const [active, setActive] = useState<Section>('dashboard')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/auth').then(r => r.json()).then(data => {
      if (data.type) setSession(data)
      else router.replace('/admin/login')
    }).catch(() => router.replace('/admin/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  const menu = ALL_MENU.filter(item => {
    if (!session) return false
    if (session.type === 'super_admin') return true
    if (!item.permKey) return true // dashboard toujours visible
    return session.permissions?.[item.permKey] === true
  })

  // Si la section active n'est plus accessible, revenir au dashboard
  useEffect(() => {
    if (menu.length > 0 && !menu.find(m => m.key === active)) {
      setActive('dashboard')
    }
  }, [menu, active])

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#1E1E2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
        Chargement…
      </div>
    )
  }

  const userName = session.type === 'sub_admin' ? session.name : 'Super Admin'
  const isSuperAdmin = session.type === 'super_admin'

  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: '#16162A', borderRight: '1px solid rgba(255,255,255,.08)', padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, background: 'var(--orange)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>SG</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Admin</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', paddingLeft: 2 }}>{userName}</div>
          {!isSuperAdmin && (
            <div style={{ fontSize: 10, color: 'var(--orange)', paddingLeft: 2, marginTop: 2 }}>
              {session.role === 'viewer' ? 'Lecteur' : 'Admin'}
            </div>
          )}
        </div>

        {menu.map(item => (
          <button key={item.key} onClick={() => setActive(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', fontSize: 13, color: active === item.key ? '#fff' : 'rgba(255,255,255,.55)', cursor: 'pointer', background: active === item.key ? 'rgba(255,255,255,.06)' : 'none', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: active === item.key ? '2px solid var(--orange)' : '2px solid transparent', width: '100%', textAlign: 'left', transition: 'background .12s, color .12s' }}>
            <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 12, paddingTop: 12, paddingLeft: 16, paddingRight: 16 }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 12, cursor: 'pointer', padding: '6px 0' }}>
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 24, background: '#1E1E2E', overflow: 'auto' }}>
        {SECTIONS[active]}
      </div>
    </div>
  )
}
