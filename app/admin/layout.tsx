import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — SAFEL GROUP',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#1E1E2E', minHeight: '100vh', color: '#fff' }}>
      {children}
    </div>
  )
}
