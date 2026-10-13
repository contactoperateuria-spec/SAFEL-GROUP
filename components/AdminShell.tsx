'use client'
import { useState } from 'react'
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

const MENU: { key: Section; icon: string; label: string }[] = [
  { key: 'dashboard', icon: '📊', label: 'Tableau de bord' },
  { key: 'commandes', icon: '📦', label: 'Commandes' },
  { key: 'produits', icon: '🛍️', label: 'Produits' },
  { key: 'cycles', icon: '📅', label: 'Cycles' },
  { key: 'douane', icon: '🏛️', label: 'Douane' },
  { key: 'clients', icon: '👥', label: 'Clients' },
  { key: 'sanscompte', icon: '🧾', label: 'Achat sans compte' },
  { key: 'archives', icon: '📁', label: 'Archives' },
  { key: 'journal', icon: '📋', label: 'Journal' },
  { key: 'parametres', icon: '⚙️', label: 'Paramètres' },
]

const SECTIONS: Record<Section, React.ReactNode> = {
  dashboard: <AdminDashboard />,
  commandes: <AdminCommandes />,
  produits: <AdminProduits />,
  cycles: <AdminCycles />,
  douane: <AdminDouane />,
  clients: <AdminClients />,
  sanscompte: <AdminSansCompte />,
  archives: <AdminArchives />,
  journal: <AdminJournal />,
  parametres: <AdminParametres />,
}

export default function AdminShell() {
  const [active, setActive] = useState<Section>('dashboard')
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: '#16162A', borderRight: '1px solid rgba(255,255,255,.08)', padding: '20px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 12, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--orange)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>SG</div>
          Admin
        </div>
        {MENU.map(item => (
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
