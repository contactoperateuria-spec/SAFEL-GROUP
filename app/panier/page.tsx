'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function PanierPage() {
  const router = useRouter()
  const { items, updateQty, removeItem, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Votre panier est vide</div>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Parcourez le catalogue pour ajouter des articles.</p>
        <Link href="/catalogue" className="btn-primary" style={{ height: 44, fontSize: 15, borderRadius: 22, padding: '0 24px' }}>
          Voir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h2 className="section-title" style={{ marginBottom: 24 }}>
        Mon panier <span style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400 }}>({items.length} article{items.length > 1 ? 's' : ''})</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Articles */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          {items.map(item => (
            <div key={item.product_id} style={{ display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : item.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{item.color}{item.size ? ` · ${item.size}` : ''}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-2)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-2)' }}>−</button>
                    <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-2)' }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-3)', padding: '4px 8px', borderRadius: 4 }}>
                    🗑 Retirer
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--orange)' }}>{fmt(item.price * item.quantity)} FCFA</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmt(item.price)} × {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'sticky', top: 72 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Récapitulatif</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: 'var(--text-2)' }}>Sous-total</span>
            <span>{fmt(total())} FCFA</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 16, color: 'var(--text-3)' }}>
            <span>Frais de livraison & douane</span>
            <span>Calculés à l&apos;arrivée</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Total marchandises</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>{fmt(total())} FCFA</span>
          </div>

          <button
            onClick={() => router.push('/coupon')}
            className="btn-cta"
            style={{ width: '100%', height: 48, fontSize: 15, borderRadius: 12, marginBottom: 10 }}
          >
            Générer mon reçu
          </button>

          <Link href="/catalogue" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
            ← Continuer mes achats
          </Link>

          <div style={{ marginTop: 14, background: 'var(--bg)', borderRadius: 8, padding: 10, fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span>🔒</span>
            <span>Panier conservé 7 jours. Le paiement se fait après confirmation de votre commande.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
