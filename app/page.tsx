import Link from 'next/link'
import CycleBanner from '@/components/CycleBanner'

const CATEGORIES = [
  { emoji: '🏠', name: 'Maison & Cuisine' },
  { emoji: '👗', name: 'Mode Femme' },
  { emoji: '👔', name: 'Mode Homme' },
  { emoji: '👜', name: 'Accessoires' },
  { emoji: '📱', name: 'Électronique' },
  { emoji: '💄', name: 'Beauté' },
  { emoji: '🧸', name: 'Jouets' },
  { emoji: '📦', name: 'Divers' },
]

const NOUVEAUTES = [
  { emoji: '🧴', bg: '#FFF0E6', badge: 'Nouveau', badgeClass: 'badge-new', name: 'Sérum Vitamine C 30ml', price: '4 500 FCFA', moq: 'Minimum : 2 pièces' },
  { emoji: '🎧', bg: '#E8F0FE', badge: '⭐ Populaire', badgeClass: 'badge-hot', name: 'Écouteurs Bluetooth TWS', price: '18 000 FCFA', moq: 'Minimum : 1 pièce' },
  { emoji: '🪴', bg: '#F0FAE8', badge: 'Nouveau', badgeClass: 'badge-new', name: 'Pot décoratif moderne', price: '7 200 FCFA', moq: 'Minimum : 3 pièces' },
  { emoji: '👗', bg: '#FEF3E8', badge: 'Se termine bientôt', badgeClass: 'badge-ending', name: "Robe d'été florale S-XL", price: '14 500 FCFA', moq: 'Minimum : 2 pièces' },
]

export default function HomePage() {
  return (
    <>
      <CycleBanner />

      {/* HERO */}
      <div style={{ background: 'var(--white)', padding: '40px 0 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="hero-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Commandes groupées · Achat sécurisé
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, color: 'var(--text)', marginBottom: 14 }}>
                Achetez en Chine,<br />livré à <span style={{ color: 'var(--orange)' }}>Lomé</span> — sans stock
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)', marginBottom: 24, maxWidth: 440 }}>
                Choisissez vos articles pendant la période d&apos;ouverture du cycle. Nous achetons groupé à la clôture. Vous payez la marchandise, les frais de douane sont fixés à l&apos;arrivée.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/catalogue" className="btn-primary" style={{ height: 44, fontSize: 15, borderRadius: 22, padding: '0 22px' }}>
                  Voir le catalogue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="/suivi" className="btn-outline" style={{ height: 44, fontSize: 15, borderRadius: 22 }}>
                  Suivre un colis
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 28 }}>
                {['Coûts réduits', 'Pas de stock', 'Processus clair', 'Commandes groupées'].map(p => (
                  <div key={p} className="promise-item">
                    <div className="promise-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual preview */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--border)' }}>
              {[
                { emoji: '🧴', bg: '#FFF0E6', name: 'Sérum Vitamine C 30ml', cat: 'Beauté · Soins visage', price: '4 500 FCFA', moq: 'min. 2 pcs' },
                { emoji: '🎧', bg: '#E8F0FE', name: 'Écouteurs Bluetooth Pro', cat: 'Électronique', price: '18 000 FCFA', moq: 'min. 1 pc' },
              ].map(p => (
                <div key={p.name} style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 8, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{p.cat}</div>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>{p.price}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6 }}>{p.moq}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ background: 'var(--white)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                  <strong>SG-2025-0041</strong> — Arrivé à Lomé ✓
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
                  <strong>SG-2025-0038</strong> — En transit · Douane à régler
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATÉGORIES */}
      <div className="section">
        <div className="container">
          <h2 className="section-title">Parcourir par catégorie</h2>
          <p className="section-sub">Sélectionnez une catégorie pour voir tous les articles du cycle en cours</p>
          <div className="cats-grid">
            {CATEGORIES.map(c => (
              <Link href={`/catalogue?categorie=${encodeURIComponent(c.name)}`} key={c.name} className="cat-item">
                <div className="cat-emoji">{c.emoji}</div>
                <div className="cat-name">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* NOUVEAUTÉS */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Nouveautés du cycle</h2>
            <Link href="/catalogue" className="btn-outline" style={{ fontSize: 13, height: 34 }}>Tout voir</Link>
          </div>
          <div className="product-grid">
            {NOUVEAUTES.map(p => (
              <Link href="/catalogue" key={p.name} className="product-card">
                <div className="product-img" style={{ background: p.bg }}>{p.emoji}</div>
                <div className="product-body">
                  <span className={`product-badge ${p.badgeClass}`}>{p.badge}</span>
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-price">{p.price}</div>
                  <div className="product-card-moq">{p.moq}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <div className="section" style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Comment ça marche</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Quatre étapes simples, du choix à la livraison</p>
          <div className="steps-grid">
            {[
              { num: '1', icon: '🛍️', label: 'Je choisis', desc: "Parcourez le catalogue et ajoutez vos articles au panier pendant la période d'ouverture." },
              { num: '2', icon: '💳', label: 'Je paye', desc: 'Payez la marchandise par Moov Money ou Mixx by Yas. Votre coupon PDF est généré immédiatement.' },
              { num: '3', icon: '🇨🇳', label: 'Achat en Chine', desc: 'À la clôture du cycle, nous passons la commande groupée auprès du fournisseur.' },
              { num: '4', icon: '📦', label: 'Je reçois', desc: "À l'arrivée à Lomé, vous réglez les frais de douane et récupérez votre colis." },
            ].map(s => (
              <div key={s.num} className="step-item">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-label">{s.label}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
