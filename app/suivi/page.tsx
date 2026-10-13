'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getOrderByRef } from '@/lib/db'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

const TRACKING_STEPS = [
  { key: 'pending',         label: 'Commande reçue' },
  { key: 'paid',            label: 'Paiement validé' },
  { key: 'in_transit',      label: 'En transit (Chine → Togo)' },
  { key: 'in_customs',      label: 'En douane' },
  { key: 'customs_cleared', label: 'Dédouanée' },
  { key: 'ready',           label: 'Prête à retirer' },
  { key: 'delivered',       label: 'Livrée' },
]

const STATUS_LABEL: Record<string, string> = {
  pending:         'En attente',
  confirmed:       'Confirmée',
  paid:            'Paiement validé',
  in_transit:      'En transit',
  in_customs:      'En douane',
  customs_cleared: 'Dédouanée',
  ready:           'Prête à retirer',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}

function getStepIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, confirmed: 1, paid: 1,
    in_transit: 2, in_customs: 3,
    customs_cleared: 4, ready: 5, delivered: 6,
  }
  return map[status] ?? 0
}

const FAQ = [
  { q: 'Combien de temps prend la livraison ?', a: 'En général 30 à 40 jours après la clôture du cycle. Ce délai dépend de l\'expédition depuis la Chine et des délais douaniers.' },
  { q: 'Comment fonctionnent les frais de douane ?', a: 'Les frais sont calculés à l\'arrivée des marchandises à Lomé. Vous êtes notifié sur votre compte client avec le montant exact à régler.' },
  { q: 'Puis-je annuler ma commande ?', a: 'Une commande payée ne peut pas être annulée car elle est transmise au fournisseur. Si SAFEL GROUP annule un produit, vous êtes remboursé à 100 % sous 7 jours.' },
  { q: 'Comment retirer mon colis ?', a: 'Livraison à Lomé et environs, ou retrait sur place au dépôt. Hors zone, retrait au lieu du conteneur avec le numéro du livreur fourni.' },
]

function SuiviInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ref, setRef] = useState(searchParams.get('ref') ?? '')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!ref.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)
    const result = await getOrderByRef(ref.trim())
    setLoading(false)
    if (!result) { setNotFound(true); return }
    setOrder(result)
    router.replace(`/suivi?ref=${encodeURIComponent(ref.trim().toUpperCase())}`, { scroll: false })
  }

  const isCancelled = order && ['cancelled', 'refunded'].includes(order.status)
  const stepIndex = order ? getStepIndex(order.status) : -1

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Recherche */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1px solid var(--border)', textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Suivre mon colis</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
          Entrez votre numéro de commande (ex. SG-2025-0041)
        </p>
        <div style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Ex. SG-2025-0041"
            value={ref}
            onChange={e => setRef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, height: 44, border: '1.5px solid var(--border-2)', borderRadius: 22, padding: '0 16px', fontSize: 14, outline: 'none' }}
          />
          <button className="btn-primary" style={{ height: 44, borderRadius: 22 }} onClick={handleSearch} disabled={loading}>
            {loading ? '…' : 'Rechercher'}
          </button>
        </div>
        {notFound && (
          <div style={{ marginTop: 14, fontSize: 13, color: '#C62828', background: '#FEE8E8', borderRadius: 6, padding: '8px 14px', display: 'inline-block' }}>
            Aucune commande trouvée pour cette référence.
          </div>
        )}
      </div>

      {/* Résultat */}
      {order && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24 }}>
          {/* En-tête commande */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Commande {order.reference}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                {order.cycles?.name ? ` · Cycle ${order.cycles.name}` : ''}
              </div>
              {/* Articles */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {(order.order_items ?? []).map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 8, padding: '4px 10px 4px 4px', border: '1px solid var(--border)', fontSize: 12 }}>
                    {item.products?.images?.[0] ? (
                      <img src={item.products.images[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 5 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, background: 'var(--border)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 500 }}>{item.products?.name ?? 'Produit'}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                        ×{item.quantity}{item.color ? ` · ${item.color}` : ''}
                        {' · '}{fmt((item.unit_price_cfa ?? 0) * item.quantity)} FCFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, background: isCancelled ? '#FEE8E8' : '#EEF2FF', color: isCancelled ? '#C62828' : '#4338CA', whiteSpace: 'nowrap' }}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>

          {/* Tracker ou message annulation */}
          {isCancelled ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#991B1B' }}>
              {order.status === 'cancelled'
                ? 'Cette commande a été annulée. Contactez SAFEL GROUP pour plus d\'informations.'
                : 'Cette commande a été remboursée. Le montant sera restitué sous 7 jours ouvrés.'}
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Barre de progression */}
              <div style={{ position: 'absolute', left: 5, top: 8, width: 2, bottom: 8, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: 'var(--orange)', borderRadius: 2, height: `${Math.max(0, (stepIndex / (TRACKING_STEPS.length - 1)) * 100)}%`, transition: 'height .4s' }} />
              </div>
              {TRACKING_STEPS.map((step, i) => {
                const isDone = i < stepIndex
                const isCurrent = i === stepIndex
                const isFuture = i > stepIndex
                return (
                  <div key={step.key} style={{ position: 'relative', paddingBottom: i === TRACKING_STEPS.length - 1 ? 0 : 18, fontSize: 13 }}>
                    <div style={{
                      position: 'absolute', left: -24, top: 3,
                      width: 12, height: 12, borderRadius: '50%', zIndex: 1,
                      border: `2px solid ${isDone ? '#22C55E' : isCurrent ? 'var(--orange)' : 'var(--border-2)'}`,
                      background: isDone ? '#22C55E' : isCurrent ? 'var(--orange)' : 'var(--white)',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(249,115,22,.2)' : 'none',
                    }} />
                    <div style={{ fontWeight: isCurrent ? 700 : 500, color: isDone ? 'var(--text)' : isCurrent ? 'var(--orange-dark)' : 'var(--text-3)' }}>
                      {step.label}
                      {isCurrent && <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(249,115,22,.1)', color: 'var(--orange)', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>← Vous êtes ici</span>}
                    </div>
                    {isFuture && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>—</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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

export default function SuiviPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-3)' }}>Chargement…</div>}>
      <SuiviInner />
    </Suspense>
  )
}
