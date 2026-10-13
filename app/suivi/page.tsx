'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const FAQ = [
  { q: 'Combien de temps prend la livraison ?', a: 'En général 30 à 40 jours après la clôture du cycle. Ce délai dépend de l\'expédition depuis la Chine et des délais douaniers.' },
  { q: 'Comment fonctionnent les frais de douane ?', a: 'Les frais sont calculés à l\'arrivée des marchandises à Lomé. Vous êtes notifié sur votre compte client avec le montant exact à régler.' },
  { q: 'Puis-je annuler ma commande ?', a: 'Une commande payée ne peut pas être annulée car elle est transmise au fournisseur. Si SAFEL GROUP annule un produit, vous êtes remboursé à 100 % sous 7 jours.' },
  { q: 'Comment retirer mon colis ?', a: 'Livraison à Lomé et environs, ou retrait sur place au dépôt. Hors zone, retrait au lieu du conteneur avec le numéro du livreur fourni.' },
]

export default function SuiviPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/compte')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) return null

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      {/* Bloc principal */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 36, border: '1px solid var(--border)', textAlign: 'center', maxWidth: 480, margin: '0 auto 32px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Suivre mon colis</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 28 }}>
          Le suivi de commande est disponible dans votre espace client.<br />
          Connectez-vous pour voir le statut de vos commandes en temps réel.
        </p>
        <button
          onClick={() => router.push('/connexion?redirect=/compte')}
          className="btn-primary"
          style={{ height: 46, borderRadius: 23, fontSize: 15, paddingLeft: 28, paddingRight: 28, justifyContent: 'center' }}
        >
          Se connecter à mon compte
        </button>
        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-3)' }}>
          Pas encore de compte ?{' '}
          <button onClick={() => router.push('/connexion')} style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>
            Créer un compte
          </button>
        </div>
      </div>

      {/* FAQ */}
      <h3 id="faq" style={{ fontSize: 18, fontWeight: 700, margin: '32px 0 16px' }}>Questions fréquentes</h3>
      {FAQ.map((item, i) => (
        <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            style={{ width: '100%', padding: '14px 16px', fontSize: 14, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)' }}
          >
            {item.q}
            <span style={{ fontSize: 18, color: 'var(--text-3)', flexShrink: 0, marginLeft: 8 }}>{openFaq === i ? '−' : '+'}</span>
          </button>
          {openFaq === i && (
            <div style={{ padding: '0 16px 14px', fontSize: 13, lineHeight: 1.65, color: 'var(--text-2)' }}>{item.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
