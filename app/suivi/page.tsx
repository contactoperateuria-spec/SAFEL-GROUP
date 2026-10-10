'use client'
import { useState } from 'react'

const STATUTS = [
  { key: 'received', label: 'Commande reçue', date: '12 sept. 2025', done: true },
  { key: 'paid', label: 'Paiement validé', date: '13 sept. 2025', done: true },
  { key: 'bought', label: 'Acheté en Chine', date: '22 sept. 2025', done: true },
  { key: 'shipped', label: 'Expédié', date: '28 sept. 2025', done: true },
  { key: 'transit', label: 'En transit ← Vous êtes ici', date: 'Depuis le 1 oct. 2025', current: true },
  { key: 'arrived', label: 'Arrivé à Lomé', date: 'Estimé mi-octobre 2025', done: false },
  { key: 'customs', label: 'Douane à régler', date: '—', done: false },
  { key: 'ready', label: 'Prêt à retirer / En livraison', date: '—', done: false },
  { key: 'delivered', label: 'Livré', date: '—', done: false },
]

const FAQ = [
  { q: 'Combien de temps prend la livraison ?', a: 'En général 30 à 40 jours après la clôture du cycle. Ce délai dépend de l\'expédition depuis la Chine et des délais douaniers, qui peuvent varier.' },
  { q: 'Comment fonctionnent les frais de douane ?', a: 'Les frais sont fixés à l\'arrivée des marchandises à Lomé. Vous êtes notifié sur votre compte client avec le montant exact à régler.' },
  { q: 'Puis-je annuler ma commande ?', a: 'Une commande payée ne peut pas être remboursée car elle est transmise au fournisseur. Si SAFEL GROUP annule un produit, vous êtes remboursé à 100 % sous 7 jours.' },
  { q: 'Comment retirer mon colis ?', a: 'Livraison à Lomé et environs, ou retrait sur place au dépôt. Hors zone, retrait au lieu du conteneur avec le numéro du livreur fourni par l\'admin.' },
]

export default function SuiviPage() {
  const [ref, setRef] = useState('SG-2025-0041')
  const [searched, setSearched] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Recherche */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1px solid var(--border)', textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Suivre mon colis</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
          Entrez votre numéro de commande (SG-AAAA-NNNN) ou votre numéro de bordereau
        </p>
        <div style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Ex. SG-2025-0041 ou BL-2025-012"
            value={ref}
            onChange={e => setRef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearched(true)}
            style={{ flex: 1, height: 44, border: '1.5px solid var(--border-2)', borderRadius: 22, padding: '0 16px', fontSize: 14, outline: 'none' }}
          />
          <button className="btn-primary" style={{ height: 44, borderRadius: 22 }} onClick={() => setSearched(true)}>
            Rechercher
          </button>
        </div>
      </div>

      {/* Résultat */}
      {searched && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 2 }}>Commande {ref}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Passée le 12 sept. 2025 · Bordereau BL-2025-008</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 7, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                  🎧
                  <span style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--orange)', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid var(--white)' }}>×1</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#EEF2FF', color: '#4338CA' }}>En transit</span>
          </div>

          {/* Progress */}
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {STATUTS.map((s, i) => {
              const isLast = i === STATUTS.length - 1
              const isDone = s.done
              const isCurrent = s.current
              return (
                <div key={s.key} style={{ position: 'relative', paddingBottom: isLast ? 0 : 18, fontSize: 13 }}>
                  <div style={{
                    position: 'absolute', left: -24, top: 3,
                    width: 12, height: 12, borderRadius: '50%',
                    border: `2px solid ${isDone ? 'var(--green)' : isCurrent ? 'var(--orange)' : 'var(--border-2)'}`,
                    background: isDone ? 'var(--green)' : isCurrent ? 'var(--orange)' : 'var(--white)',
                    boxShadow: isCurrent ? '0 0 0 3px var(--orange-light)' : 'none',
                  }} />
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: -18, top: 15,
                      width: 2, bottom: 0,
                      background: isDone ? 'var(--green)' : 'var(--border)',
                    }} />
                  )}
                  <div style={{ fontWeight: isCurrent ? 600 : 500, color: isDone ? 'var(--text)' : isCurrent ? 'var(--orange-dark)' : 'var(--text-2)' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{s.date}</div>
                </div>
              )
            })}
          </div>
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
