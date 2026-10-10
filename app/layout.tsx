import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WaFab from '@/components/WaFab'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SAFEL GROUP — Précommandes Chine · Lomé',
  description: 'Achetez en Chine, livré à Lomé sans stock. Commandes groupées, processus clair, paiement sécurisé.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WaFab />
      </body>
    </html>
  )
}
